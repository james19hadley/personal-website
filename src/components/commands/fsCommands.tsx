import { type Command } from './types';

export const fsCommands: { [key: string]: Command } = {
  download: {
    name: 'download',
    description: 'Download a file from the virtual filesystem to your local computer',
    execute: ({ args, wasmModule, currentPwd }) => {
      const filename = args[0];
      if (!filename) {
        return <p className="error-text">Usage: download &lt;filename&gt;</p>;
      }

      if (!wasmModule) {
        return <p className="error-text">Wasm module not loaded.</p>;
      }

      const absolutePath = filename.startsWith('/')
        ? filename
        : (currentPwd === '/' ? '' : currentPwd) + '/' + filename;

      try {
        const executeFn = wasmModule.cwrap('execute_command', 'string', ['string']);
        const catResult = executeFn(`cat ${absolutePath}`);

        if (catResult.startsWith('cat: ')) {
          return <p className="error-text">{catResult.trim()}</p>;
        }

        const blob = new Blob([catResult], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);

        return <p className="highlight">Downloading file: {filename}...</p>;
      } catch (err: any) {
        return <p className="error-text">Failed to download file: {err.message || String(err)}</p>;
      }
    }
  },
  upload: {
    name: 'upload',
    description: 'Upload a file from your computer into the virtual filesystem',
    execute: ({ wasmModule, currentPwd, setHistory }) => {
      if (!wasmModule) {
        return <p className="error-text">Wasm module not loaded.</p>;
      }

      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '*/*';

      input.onchange = (e: any) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const MAX_SIZE = 500 * 1024; // 500 KB limit
        if (file.size > MAX_SIZE) {
          setHistory(prev => [
            ...prev,
            {
              output: <p className="error-text">Failed to upload: File "{file.name}" ({Math.round(file.size / 1024)} KB) exceeds the maximum limit of 500 KB for the in-memory virtual filesystem.</p>
            }
          ]);
          return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          const absolutePath = (currentPwd === '/' ? '' : currentPwd) + '/' + file.name;

          try {
            const writeFileFn = wasmModule.cwrap('write_file_raw', null, ['string', 'string']);
            writeFileFn(absolutePath, content);

            const serializeFn = wasmModule.cwrap('serialize_fs', 'string', []);
            const state = serializeFn();
            localStorage.setItem('zijh-fs-state', state);

            setHistory(prev => [
              ...prev,
              {
                output: <p className="highlight">Successfully uploaded file "{file.name}" to {absolutePath} ({content.length} bytes).</p>
              }
            ]);
          } catch (err: any) {
            setHistory(prev => [
              ...prev,
              {
                output: <p className="error-text">Failed to save uploaded file: {err.message || String(err)}</p>
              }
            ]);
          }
        };

        reader.onerror = () => {
          setHistory(prev => [
            ...prev,
            {
              output: <p className="error-text">Failed to read file: {file.name}</p>
            }
          ]);
        };

        reader.readAsText(file);
      };

      input.click();
      return <p className="morph-text">Opening file dialog... Please select a file to upload.</p>;
    }
  },
  vim: {
    name: 'vim',
    description: 'Open built-in Vim text editor',
    execute: ({ args, openVimEditor }) => {
      const filename = args[0];
      if (!filename) {
        return <p className="error-text">Usage: vim &lt;filename&gt;</p>;
      }
      openVimEditor(filename);
      return <p className="morph-text">Opening Vim editor: {filename}...</p>;
    }
  },
  df: {
    name: 'df',
    description: 'Display virtual disk space usage & limits',
    execute: ({ wasmModule }) => {
      if (!wasmModule) {
        return <p className="error-text">Wasm module not loaded.</p>;
      }
      try {
        const serializeFn = wasmModule.cwrap('serialize_fs', 'string', []);
        const state = serializeFn() || '[]';
        const usedBytes = new Blob([state]).size;
        const totalBytes = 5 * 1024 * 1024; // 5 MB LocalStorage limit
        const freeBytes = Math.max(0, totalBytes - usedBytes);
        
        const totalMb = (totalBytes / (1024 * 1024)).toFixed(2);
        const freeMb = (freeBytes / (1024 * 1024)).toFixed(2);
        const usedMb = (usedBytes / (1024 * 1024)).toFixed(2);
        const usePercent = ((usedBytes / totalBytes) * 100).toFixed(1);

        return (
          <div className="cmd-output-df">
            <p className="section-title">Virtual Disk Space Usage (Local Storage):</p>
            <pre className="df-output" style={{ background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '4px', margin: '8px 0', fontFamily: 'monospace' }}>
{`Filesystem      Size        Used        Available   Use%
zijh-vfs        ${totalMb} MB     ${usedMb} MB     ${freeMb} MB     ${usePercent}%`}
            </pre>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px', lineHeight: '1.4' }}>
              <span className="highlight">Why is there a limit?</span> The virtual filesystem resides in browser Local Storage, which enforces a strict quota of **5.00 MB** per domain. To prevent crashes, individual file uploads are capped at **500 KB** and the runtime environment uses WebAssembly memory limits.
            </p>
          </div>
        );
      } catch (err: any) {
        return <p className="error-text">Failed to fetch disk usage: {err.message || String(err)}</p>;
      }
    }
  }
};
