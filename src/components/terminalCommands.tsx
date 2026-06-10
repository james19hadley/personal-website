import { fsCommands } from './commands/fsCommands';
import { infoCommands } from './commands/infoCommands';
import { sysCommands } from './commands/sysCommands';
import { type LogEntry, type CommandContext, type Command, type TerminalLayoutProps } from './commands/types';

export { type LogEntry, type CommandContext, type Command, type TerminalLayoutProps };

export const POKEMON_POOL = [
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

export const commandsRegistry: { [key: string]: Command } = {
  ...sysCommands,
  ...infoCommands,
  ...fsCommands
};
