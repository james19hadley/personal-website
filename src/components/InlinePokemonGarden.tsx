import { useState, useEffect, useRef } from 'react';
import './InlinePokemonGarden.css';

interface PokemonState {
  id: number;
  name: string;
  x: number; // grid coordinates 1..8
  y: number; // grid coordinates 1..4
  facingLeft: boolean;
  spriteUrl: string;
  isShiny: boolean;
}

const STARTER_POOL = [
  { id: 1, name: 'bulbasaur' },
  { id: 4, name: 'charmander' },
  { id: 7, name: 'squirtle' },
  { id: 25, name: 'pikachu' },
  { id: 133, name: 'eevee' },
  { id: 151, name: 'mew' }
];

/**
 * @component InlinePokemonGarden
 * @description Inline retro Pokémon Garden meadow. Renders a grid-based garden containing animated Pokémon sprites
 * that walk around randomly and play retro synthesize sound effects/cries on click.
 */
export const InlinePokemonGarden = () => {
  const [pokemon, setPokemon] = useState<PokemonState[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize a set of 4-5 random Pokémon in the garden
  useEffect(() => {
    const initialPokemon: PokemonState[] = [];
    const usedPositions = new Set<string>();

    // Spawn 4 starting Pokémon
    while (initialPokemon.length < 4) {
      const pInfo = STARTER_POOL[Math.floor(Math.random() * STARTER_POOL.length)];
      const x = Math.floor(Math.random() * 8) + 1; // 1 to 8
      const y = Math.floor(Math.random() * 4) + 1; // 1 to 4
      const posKey = `${x},${y}`;

      if (!usedPositions.has(posKey)) {
        usedPositions.add(posKey);
        const isShiny = Math.random() < 0.1; // 10% shiny rate
        const spriteUrl = isShiny
          ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/shiny/${pInfo.id}.gif`
          : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${pInfo.id}.gif`;

        initialPokemon.push({
          id: pInfo.id,
          name: pInfo.name + (isShiny ? ' (Shiny✨)' : ''),
          x,
          y,
          facingLeft: Math.random() < 0.5,
          spriteUrl,
          isShiny
        });
      }
    }

    setPokemon(initialPokemon);
  }, []);

  // Calm walking animation timer
  useEffect(() => {
    const moveTimer = setInterval(() => {
      setPokemon(prevList => {
        return prevList.map(poke => {
          // 40% chance to take a step
          if (Math.random() > 0.4) {
            return poke;
          }

          // Generate adjacent valid coordinates
          const possibleMoves: { x: number; y: number; facingLeft: boolean }[] = [];
          
          // Left
          if (poke.x > 1) possibleMoves.push({ x: poke.x - 1, y: poke.y, facingLeft: true });
          // Right
          if (poke.x < 8) possibleMoves.push({ x: poke.x + 1, y: poke.y, facingLeft: false });
          // Up
          if (poke.y > 1) possibleMoves.push({ x: poke.x, y: poke.y - 1, facingLeft: poke.facingLeft });
          // Down
          if (poke.y < 4) possibleMoves.push({ x: poke.x, y: poke.y + 1, facingLeft: poke.facingLeft });

          if (possibleMoves.length === 0) return poke;

          // Check if coordinates are occupied
          const unOccupiedMoves = possibleMoves.filter(move => {
            return !prevList.some(other => other.x === move.x && other.y === move.y);
          });

          if (unOccupiedMoves.length === 0) return poke;

          const chosenMove = unOccupiedMoves[Math.floor(Math.random() * unOccupiedMoves.length)];
          return {
            ...poke,
            x: chosenMove.x,
            y: chosenMove.y,
            facingLeft: chosenMove.facingLeft
          };
        });
      });
    }, 3500);

    return () => clearInterval(moveTimer);
  }, []);

  // Retro beep synth cry
  const playCry = (isShiny: boolean) => {
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

      osc.type = 'square';
      osc.frequency.setValueAtTime(isShiny ? 880 : 440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(isShiny ? 1200 : 587, ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {
      console.warn('AudioContext beep failed:', e);
    }
  };

  // Helper to render background tiles (10x6)
  const renderTiles = () => {
    const tiles = [];
    for (let y = 0; y < 6; y++) {
      for (let x = 0; x < 10; x++) {
        let tileType = 'grass';
        let content = '';

        if (x === 0 || x === 9 || y === 0 || y === 5) {
          tileType = 'boundary';
          // Render fences or trees at boundaries
          if ((x === 0 || x === 9) && (y === 0 || y === 5)) {
            content = '🪵'; // corner posts
          } else if (y === 0 || y === 5) {
            content = '🪵'; // horizontal fence logs
          } else {
            content = '🌳'; // vertical trees
          }
        } else {
          // Meadow tiles
          const isDarkGrass = (x + y) % 2 === 0;
          tileType = isDarkGrass ? 'grass-dark' : 'grass-light';
          
          // Place occasional flower emojis
          if ((x === 2 && y === 2) || (x === 7 && y === 3)) {
            content = '🌸';
          } else if (x === 5 && y === 1) {
            content = '🌷';
          }
        }

        tiles.push(
          <div key={`${x},${y}`} className={`inline-garden-tile tile-${tileType}`}>
            {content}
          </div>
        );
      }
    }
    return tiles;
  };

  return (
    <div className="inline-garden-container">
      <div className="inline-garden-title">🌸 Pokémon Garden (FireRed Meadow) 🌸</div>
      <div className="inline-garden-grid">
        {renderTiles()}
        
        {pokemon.map(poke => (
          <div
            key={poke.id}
            className="inline-pokemon-sprite"
            style={{
              left: `${poke.x * 10}%`,
              top: `${poke.y * 16.666}%`,
            }}
            onClick={() => playCry(poke.isShiny)}
            title={poke.name}
          >
            <img
              src={poke.spriteUrl}
              alt={poke.name}
              className={`inline-pokemon-img ${poke.facingLeft ? 'flipped' : ''}`}
            />
          </div>
        ))}
      </div>
      <div className="inline-garden-footer">
        Click on a Pokémon to hear it beep! Type <code>gameboy</code> to play FireRed.
      </div>
    </div>
  );
};
