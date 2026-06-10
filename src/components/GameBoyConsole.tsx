import { useState, useRef } from 'react';
import { ArrowLeft, Maximize2, Minimize2, Power } from 'lucide-react';
import './GameBoyConsole.css';

interface GameBoyConsoleProps {
  onBack: () => void;
}

interface GBAGame {
  id: string;
  name: string;
  embedUrl: string;
}

const GBA_GAMES: GBAGame[] = [
  {
    id: 'firered',
    name: 'Pokémon FireRed (v1.1)',
    embedUrl: 'https://www.retrogames.cc/embed/40238-pokemon-fire-red-version-v1-1.html'
  },
  {
    id: 'emerald',
    name: 'Pokémon Emerald',
    embedUrl: 'https://www.retrogames.cc/embed/40224-pokemon-emerald-version.html'
  },
  {
    id: 'leafgreen',
    name: 'Pokémon LeafGreen (v1.1)',
    embedUrl: 'https://www.retrogames.cc/embed/40245-pokemon-leaf-green-version-v1-1.html'
  },
  {
    id: 'ruby',
    name: 'Pokémon Ruby (v1.1)',
    embedUrl: 'https://www.retrogames.cc/embed/40237-pokemon-ruby-version-v1-1.html'
  },
  {
    id: 'sapphire',
    name: 'Pokémon Sapphire (v1.1)',
    embedUrl: 'https://www.retrogames.cc/embed/40236-pokemon-sapphire-version-v1-1.html'
  }
];

export const GameBoyConsole = ({ onBack }: GameBoyConsoleProps) => {
  const [selectedGame, setSelectedGame] = useState<GBAGame>(GBA_GAMES[0]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [powerOn, setPowerOn] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleGameChange = (gameId: string) => {
    const game = GBA_GAMES.find(g => g.id === gameId);
    if (game) {
      setSelectedGame(game);
      // Briefly toggle power to restart emulator
      setPowerOn(false);
      setTimeout(() => setPowerOn(true), 150);
    }
  };

  const togglePower = () => {
    setPowerOn(!powerOn);
  };

  return (
    <div className={`gameboy-page-wrap fade-in ${isFullscreen ? 'fullscreen-active' : ''}`}>
      {!isFullscreen && (
        <div className="gameboy-nav-bar">
          <button onClick={onBack} className="back-btn gba-back">
            <ArrowLeft size={16} />
            <span>return to terminal</span>
          </button>
          
          <div className="game-select-dropdown">
            <label htmlFor="game-select">SELECT GAME:</label>
            <select 
              id="game-select" 
              value={selectedGame.id} 
              onChange={(e) => handleGameChange(e.target.value)}
            >
              {GBA_GAMES.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* FULLSCREEN IFRAME ONLY VIEW */}
      {isFullscreen && (
        <div className="fullscreen-iframe-container">
          {powerOn && (
            <iframe
              ref={iframeRef}
              src={selectedGame.embedUrl}
              className="fullscreen-emulator-iframe"
              frameBorder="0"
              allowFullScreen
              allow="cross-origin-isolated; autoplay; keyboard"
            ></iframe>
          )}
          <button onClick={toggleFullscreen} className="close-fullscreen-btn" title="Exit Fullscreen">
            <Minimize2 size={20} />
            <span>Close Fullscreen</span>
          </button>
        </div>
      )}

      {/* HANDHELD GAMEBOY VIEW */}
      {!isFullscreen && (
        <div className="gba-handheld-body">
          {/* Top Panel & Power Switch */}
          <div className="gba-top-bar">
            <button className={`power-switch-btn ${powerOn ? 'on' : ''}`} onClick={togglePower} title="Toggle Power">
              <Power size={12} />
              <span>{powerOn ? 'OFF' : 'ON'}</span>
            </button>
            <div className="top-grooves"></div>
          </div>

          <div className="gba-inner-case">
            {/* SCREEN UNIT */}
            <div className="gba-screen-bezel">
              <div className="bezel-header">
                <div className={`power-indicator-led ${powerOn ? 'active' : ''}`}></div>
                <div className="bezel-title">GAME BOY ADVANCE</div>
              </div>

              <div className="gba-screen-viewport">
                {powerOn ? (
                  <iframe
                    ref={iframeRef}
                    src={selectedGame.embedUrl}
                    className="gba-emulator-iframe"
                    frameBorder="0"
                    allowFullScreen
                    allow="cross-origin-isolated; autoplay; keyboard"
                  ></iframe>
                ) : (
                  <div className="gba-screen-off">
                    <span className="power-off-text">POWER OFF</span>
                  </div>
                )}
              </div>

              <div className="bezel-footer">
                <button onClick={toggleFullscreen} className="gba-fullscreen-trigger" disabled={!powerOn}>
                  <Maximize2 size={12} />
                  <span>Fullscreen Mode</span>
                </button>
              </div>
            </div>

            {/* BRANDING */}
            <div className="gba-branding-logo">zijh advance</div>

            {/* CONTROLS */}
            <div className="gba-controller-layout">
              {/* D-Pad */}
              <div className="gba-dpad">
                <div className="dpad-cross horizontal"></div>
                <div className="dpad-cross vertical"></div>
                <div className="dpad-direction up"></div>
                <div className="dpad-direction down"></div>
                <div className="dpad-direction left"></div>
                <div className="dpad-direction right"></div>
                <div className="dpad-center-circle"></div>
              </div>

              {/* Action Buttons */}
              <div className="gba-action-buttons">
                <div className="gba-btn-sub b-btn-sub">
                  <div className="gba-action-circle b-circle">
                    <span>B</span>
                  </div>
                </div>
                <div className="gba-btn-sub a-btn-sub">
                  <div className="gba-action-circle a-circle">
                    <span>A</span>
                  </div>
                </div>
              </div>
            </div>

            {/* SYSTEM KEYS */}
            <div className="gba-system-keys">
              <div className="gba-sys-key-wrap">
                <div className="gba-sys-capsule select-capsule"></div>
                <span className="gba-sys-label">SELECT</span>
              </div>
              <div className="gba-sys-key-wrap">
                <div className="gba-sys-capsule start-capsule"></div>
                <span className="gba-sys-label">START</span>
              </div>
            </div>

            {/* Speaker Grille */}
            <div className="gba-speaker-grille">
              <div className="grille-line"></div>
              <div className="grille-line"></div>
              <div className="grille-line"></div>
              <div className="grille-line"></div>
            </div>
          </div>
        </div>
      )}

      {!isFullscreen && (
        <div className="gba-keyboard-helper">
          <p className="helper-title">⌨️ Keyboard Controls Mapping:</p>
          <div className="helper-grid">
            <div className="helper-item"><span className="key-cap">Arrow Keys</span> <span>D-Pad Direction</span></div>
            <div className="helper-item"><span className="key-cap">Z Key</span> <span>A Button</span></div>
            <div className="helper-item"><span className="key-cap">X Key</span> <span>B Button</span></div>
            <div className="helper-item"><span className="key-cap">Enter</span> <span>START Button</span></div>
            <div className="helper-item"><span className="key-cap">Shift</span> <span>SELECT Button</span></div>
          </div>
          <p className="helper-note">Note: Click inside the screen to focus controls. Fullscreen is recommended for keyboard play.</p>
        </div>
      )}
    </div>
  );
};
