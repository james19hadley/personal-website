import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Plus, Trash2, Volume2, VolumeX } from 'lucide-react';
import './PokemonGarden.css';

interface PokemonGardenProps {
  onBack: () => void;
}

interface PokemonInstance {
  uid: string;
  id: number;
  name: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  spriteUrl: string;
  isShiny: boolean;
  facingLeft: boolean;
  width: number;
  height: number;
}

const POKEMON_POOL = [
  { id: 1, name: 'bulbasaur' },
  { id: 4, name: 'charmander' },
  { id: 7, name: 'squirtle' },
  { id: 25, name: 'pikachu' },
  { id: 130, name: 'gyarados' },
  { id: 149, name: 'dragonite' },
  { id: 94, name: 'gengar' },
  { id: 143, name: 'snorlax' },
  { id: 133, name: 'eevee' },
  { id: 151, name: 'mew' },
  { id: 6, name: 'charizard' },
  { id: 384, name: 'rayquaza' }
];

export const PokemonGarden = ({ onBack }: PokemonGardenProps) => {
  const [pokemonList, setPokemonList] = useState<PokemonInstance[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedStarter, setSelectedStarter] = useState<string>('bulbasaur');
  const screenRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize synth sound context
  const playBeep = (freq: number, duration: number, type: OscillatorType = 'square') => {
    if (!soundEnabled) return;
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn('AudioContext failed:', e);
    }
  };

  // Helper to spawn a new pokemon
  const spawnPokemon = (pokemonId?: number) => {
    const target = pokemonId 
      ? POKEMON_POOL.find(p => p.id === pokemonId) 
      : POKEMON_POOL[Math.floor(Math.random() * POKEMON_POOL.length)];
    
    if (!target) return;

    const isShiny = Math.random() < 0.15; // 15% shiny rate in the garden!
    const uid = Math.random().toString(36).substring(2, 9);
    
    // Animated sprite URL from Gen 5 Black/White via PokeAPI Github repo
    const spriteUrl = isShiny
      ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/shiny/${target.id}.gif`
      : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${target.id}.gif`;

    // Screen dimensions or default dimensions
    const screenWidth = screenRef.current?.clientWidth || 380;
    const screenHeight = screenRef.current?.clientHeight || 240;

    // Sprite dimensions vary, approximate them
    const size = target.id === 130 || target.id === 384 || target.id === 6 || target.id === 149 ? 75 : 45;

    const newPoke: PokemonInstance = {
      uid,
      id: target.id,
      name: target.name + (isShiny ? ' (Shiny✨)' : ''),
      x: Math.random() * (screenWidth - size - 20) + 10,
      y: Math.random() * (screenHeight - size - 20) + 10,
      vx: (Math.random() * 1.2 + 0.3) * (Math.random() < 0.5 ? 1 : -1),
      vy: (Math.random() * 0.8 + 0.2) * (Math.random() < 0.5 ? 1 : -1),
      spriteUrl,
      isShiny,
      facingLeft: Math.random() < 0.5,
      width: size,
      height: size
    };

    setPokemonList(prev => [...prev, newPoke]);
    
    // Play retro spawn sound (two-tone beep)
    playBeep(isShiny ? 880 : 440, 0.08);
    setTimeout(() => playBeep(isShiny ? 1200 : 587, 0.12), 80);
  };

  // Spawn 3 starting pokemon
  useEffect(() => {
    // Small timeout to let screenRef resolve dimensions
    const timer = setTimeout(() => {
      spawnPokemon(1); // Bulbasaur
      spawnPokemon(25); // Pikachu
      spawnPokemon(133); // Eevee
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  // Frame update loop
  useEffect(() => {
    let animFrameId: number;

    const updateFrames = () => {
      const screenWidth = screenRef.current?.clientWidth || 380;
      const screenHeight = screenRef.current?.clientHeight || 240;

      setPokemonList(prevList => 
        prevList.map(poke => {
          let nx = poke.x + poke.vx;
          let ny = poke.y + poke.vy;
          let nvx = poke.vx;
          let nvy = poke.vy;
          let facingLeft = poke.facingLeft;

          // Boundary bounce checks
          if (nx <= 0) {
            nx = 0;
            nvx = -nvx;
            facingLeft = false;
          } else if (nx + poke.width >= screenWidth) {
            nx = screenWidth - poke.width;
            nvx = -nvx;
            facingLeft = true;
          }

          if (ny <= 0) {
            ny = 0;
            nvy = -nvy;
          } else if (ny + poke.height >= screenHeight) {
            ny = screenHeight - poke.height;
            nvy = -nvy;
          }

          // Random direction changes occasionally
          if (Math.random() < 0.005) {
            nvx = (Math.random() * 1.2 + 0.3) * (nvx > 0 ? 1 : -1);
            nvy = (Math.random() * 0.8 + 0.2) * (nvy > 0 ? 1 : -1);
          }

          return {
            ...poke,
            x: nx,
            y: ny,
            vx: nvx,
            vy: nvy,
            facingLeft
          };
        })
      );

      animFrameId = requestAnimationFrame(updateFrames);
    };

    animFrameId = requestAnimationFrame(updateFrames);
    return () => cancelAnimationFrame(animFrameId);
  }, []);

  const handleClear = () => {
    setPokemonList([]);
    playBeep(220, 0.15, 'triangle');
  };

  const handleStarterSpawn = () => {
    const starterObj = POKEMON_POOL.find(p => p.name === selectedStarter);
    if (starterObj) {
      spawnPokemon(starterObj.id);
    }
  };

  // Synth sounds for D-Pad/Buttons
  const handleDpadPress = (dir: string) => {
    playBeep(330, 0.05, 'sine');
    // Boost pokemon velocities in direction
    setPokemonList(prev => 
      prev.map(p => {
        let vx = p.vx;
        let vy = p.vy;
        if (dir === 'up') vy = -Math.abs(vy) - 0.5;
        if (dir === 'down') vy = Math.abs(vy) + 0.5;
        if (dir === 'left') {
          vx = -Math.abs(vx) - 0.5;
          return { ...p, vx, vy, facingLeft: true };
        }
        if (dir === 'right') {
          vx = Math.abs(vx) + 0.5;
          return { ...p, vx, vy, facingLeft: false };
        }
        return { ...p, vx, vy };
      })
    );
  };

  return (
    <div className="garden-outer-wrap fade-in">
      <div className="garden-nav-bar">
        <button onClick={onBack} className="back-btn garden-back">
          <ArrowLeft size={16} />
          <span>return to shell</span>
        </button>
        <button onClick={() => setSoundEnabled(!soundEnabled)} className="sound-toggle-btn">
          {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>
      </div>

      <div className="gameboy-body">
        {/* TOP BRANDING */}
        <div className="gameboy-header">
          <div className="branding-title">POKÉMON GARDEN</div>
          <div className="power-led-wrap">
            <div className={`power-led ${pokemonList.length > 0 ? 'active' : ''}`}></div>
            <span>POWER</span>
          </div>
        </div>

        {/* GAME SCREEN */}
        <div className="gameboy-screen-bezel">
          <div className="gameboy-screen" ref={screenRef}>
            <div className="screen-overlay-scanlines"></div>
            
            {/* GRASS FIELD ENVIRONMENT */}
            <div className="garden-field">
              {pokemonList.length === 0 && (
                <div className="garden-empty-msg">
                  <p>THE GARDEN IS EMPTY</p>
                  <p className="subtext">Press A Button to spawn Pokémon</p>
                </div>
              )}
              {pokemonList.map(poke => (
                <div
                  key={poke.uid}
                  className="pokemon-sprite-container"
                  style={{
                    transform: `translate(${poke.x}px, ${poke.y}px)`,
                    width: `${poke.width}px`,
                    height: `${poke.height}px`,
                  }}
                  title={poke.name}
                >
                  <img
                    src={poke.spriteUrl}
                    alt={poke.name}
                    className={`pokemon-sprite-img ${poke.facingLeft ? 'flipped' : ''}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain'
                    }}
                  />
                </div>
              ))}
            </div>
            
            {/* COUNTER HUD */}
            <div className="screen-hud">
              <span>QTY: {pokemonList.length}</span>
              {pokemonList.length > 0 && (
                <span className="last-spawned-name">
                  {pokemonList[pokemonList.length - 1].name}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* BRANDING BOTTOM */}
        <div className="nintendo-logo">zijh advance</div>

        {/* GAMEBOY CONTROLS CONTAINER */}
        <div className="gameboy-controls">
          {/* D-PAD */}
          <div className="dpad-container">
            <div className="dpad-axis horizontal"></div>
            <div className="dpad-axis vertical"></div>
            <button className="dpad-btn up" onClick={() => handleDpadPress('up')} aria-label="Up"></button>
            <button className="dpad-btn down" onClick={() => handleDpadPress('down')} aria-label="Down"></button>
            <button className="dpad-btn left" onClick={() => handleDpadPress('left')} aria-label="Left"></button>
            <button className="dpad-btn right" onClick={() => handleDpadPress('right')} aria-label="Right"></button>
            <div className="dpad-center"></div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="action-buttons">
            <div className="btn-wrapper">
              <button className="action-btn b-btn" onClick={handleClear} title="Clear Garden">
                <Trash2 size={16} className="btn-icon" />
              </button>
              <span className="btn-label">B</span>
            </div>
            <div className="btn-wrapper">
              <button className="action-btn a-btn" onClick={() => spawnPokemon()} title="Spawn Random Pokémon">
                <Plus size={16} className="btn-icon" />
              </button>
              <span className="btn-label">A</span>
            </div>
          </div>
        </div>

        {/* SELECT / START SYSTEM KEYS */}
        <div className="system-keys-container">
          <div className="sys-btn-wrapper">
            <div className="sys-btn select-btn" onClick={handleClear}></div>
            <span className="sys-label">CLEAR</span>
          </div>
          <div className="sys-btn-wrapper">
            <div className="sys-btn start-btn" onClick={() => spawnPokemon()}></div>
            <span className="sys-label">SPAWN</span>
          </div>
        </div>

        {/* SPAWN SELECTOR HUD */}
        <div className="starter-selector-box">
          <label htmlFor="starter-select">CHOOSE STARTER:</label>
          <select 
            id="starter-select" 
            value={selectedStarter} 
            onChange={(e) => setSelectedStarter(e.target.value)}
          >
            {POKEMON_POOL.map(p => (
              <option key={p.id} value={p.name}>{p.name}</option>
            ))}
          </select>
          <button className="spawn-starter-btn" onClick={handleStarterSpawn}>SUMMON</button>
        </div>
      </div>
    </div>
  );
};
