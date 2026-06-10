import { useEffect, useRef, useState } from 'react';

interface MatrixRainProps {
  onExit: () => void;
}

/**
 * @component MatrixRain
 * @description Fullscreen canvas overlay displaying the iconic falling Matrix digital rain code effect.
 * Listens for key events (ESC/Q/Ctrl+C) to exit and return control back to the host terminal shell.
 * @param {() => void} onExit - Callback triggered when exiting the matrix effect overlay
 */
export const MatrixRain = ({ onExit }: MatrixRainProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showClue, setShowClue] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowClue(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set dimensions based on parent size
    const resizeCanvas = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Characters
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZアイウエオカキクケコサシスセソタチツテト';
    const charArr = chars.split('');

    const fontSize = 14;
    let columns = Math.floor(canvas.width / fontSize);
    if (columns <= 0) columns = 1;

    // Y position for each column
    const drops: number[] = Array(columns).fill(1);

    const draw = () => {
      // Clear slightly transparent to create trail effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#0f0'; // bright green text
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = charArr[Math.floor(Math.random() * charArr.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        ctx.fillText(char, x, y);

        // Reset drop to top randomly after it hits bottom
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        drops[i]++;
      }
    };

    const interval = setInterval(draw, 33);

    // Key handlers to exit matrix rain
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'q' || e.key === 'Q' || (e.ctrlKey && e.key === 'c')) {
        e.preventDefault();
        onExit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onExit]);

  return (
    <div 
      className="matrix-rain-overlay" 
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: '#000',
        zIndex: 100,
        color: '#0f0',
        fontFamily: 'monospace'
      }}
    >
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
      {showClue && (
        <div 
          style={{
            position: 'absolute',
            top: '12px',
            right: '18px',
            background: 'rgba(0, 0, 0, 0.7)',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '0.8rem',
            border: '1px solid #0f0',
            pointerEvents: 'none',
            zIndex: 101,
            fontFamily: 'var(--font-mono)'
          }}
        >
          [ cmatrix active — press Q or ESC to exit ]
        </div>
      )}
    </div>
  );
};
