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
    execute: ({ args, wasmModule }) => {
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

        const showHelp = args && (args.includes('--help') || args.includes('-h'));

        return (
          <div className="cmd-output-df">
            <p className="section-title">Virtual Disk Space Usage (Local Storage):</p>
            <pre className="df-output" style={{ background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '4px', margin: '8px 0', fontFamily: 'monospace' }}>
{`Filesystem      Size        Used        Available   Use%
zijh-vfs        ${totalMb} MB     ${usedMb} MB     ${freeMb} MB     ${usePercent}%`}
            </pre>
            {showHelp ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px', lineHeight: '1.4' }}>
                <span className="highlight font-bold">Why is there a limit?</span> The virtual filesystem resides in browser Local Storage, which enforces a strict quota of <span className="highlight">5.00 MB</span> per domain. To prevent crashes, individual file uploads are capped at <span className="highlight">500 KB</span> and the runtime environment uses WebAssembly memory limits.
              </p>
            ) : (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Type <span className="highlight">df --help</span> or <span className="highlight">df -h</span> to view details about storage limits.
              </p>
            )}
          </div>
        );
      } catch (err: any) {
        return <p className="error-text">Failed to fetch disk usage: {err.message || String(err)}</p>;
      }
    }
  },
  gist: {
    name: 'gist',
    description: 'Fetch and import files from a public GitHub Gist into the virtual filesystem',
    execute: ({ args, wasmModule, currentPwd, setHistory }) => {
      const gistId = args[0];
      if (!gistId) {
        return <p className="error-text">Usage: gist &lt;gist_id&gt;</p>;
      }

      if (!wasmModule) {
        return <p className="error-text">Wasm module not loaded.</p>;
      }

      fetch(`https://api.github.com/gists/${gistId}`)
        .then(res => {
          if (!res.ok) throw new Error(`GitHub API returned status ${res.status}`);
          return res.json();
        })
        .then(data => {
          const files = data.files;
          if (!files || Object.keys(files).length === 0) {
            throw new Error('No files found in this Gist.');
          }

          const fileNames = Object.keys(files);
          let successCount = 0;
          const logOutputs: string[] = [];

          for (const name of fileNames) {
            const fileData = files[name];
            const content = fileData.content || '';
            const size = new Blob([content]).size;
            
            const MAX_SIZE = 500 * 1024;
            if (size > MAX_SIZE) {
              logOutputs.push(`File "${name}" exceeds 500 KB limit and was skipped.`);
              continue;
            }

            const absolutePath = (currentPwd === '/' ? '' : currentPwd) + '/' + name;
            
            try {
              wasmModule.cwrap('write_file_raw', null, ['string', 'string'])(absolutePath, content);
              successCount++;
              logOutputs.push(`Imported "${name}" (${size} bytes)`);
            } catch (err: any) {
              logOutputs.push(`Failed to write "${name}": ${err.message || String(err)}`);
            }
          }

          try {
            const state = wasmModule.cwrap('serialize_fs', 'string', [])();
            localStorage.setItem('zijh-fs-state', state);
          } catch {}

          setHistory(prev => [
            ...prev,
            {
              output: (
                <div className="gist-import-results">
                  <p className="highlight">Gist import completed: {successCount} file(s) imported successfully.</p>
                  <ul className="help-list" style={{ paddingLeft: '14px', listStyleType: 'circle' }}>
                    {logOutputs.map((log, idx) => <li key={idx}>{log}</li>)}
                  </ul>
                </div>
              )
            }
          ]);
        })
        .catch(err => {
          setHistory(prev => [
            ...prev,
            {
              output: <p className="error-text">Failed to import Gist "{gistId}": {err.message || String(err)}</p>
            }
          ]);
        });

      return <p className="morph-text">Fetching Gist "{gistId}" from GitHub API...</p>;
    }
  }
};
