import { supabase } from './supabase';
import { VM } from 'vm2';

const TICK_RATE = 1000; // 1 tick per second

interface Player {
  id: string;
  script_code: string;
  script_name: string;
}

interface Ship {
  id: string;
  playerId: string;
  x: number;
  y: number;
  cargo: Record<string, number>;
}

// API that will be exposed to player scripts
const createPlayerAPI = (playerId: string) => ({
  getShips: async (): Promise<Ship[]> => {
    const { data: ships, error } = await supabase
      .from('ships')
      .select('*')
      .eq('player_id', playerId);
    if (error) throw new Error(`Failed to fetch ships: ${error.message}`);
    return ships;
  },
  moveShip: async (shipId: string, x: number, y: number): Promise<void> => {
    const { error } = await supabase
      .from('ships')
      .update({ x, y })
      .eq('id', shipId)
      .eq('player_id', playerId);
    if (error) throw new Error(`Failed to move ship: ${error.message}`);
  },
  mineResources: async (shipId: string, resourceType: string): Promise<void> => {
    // Implement mining logic here
    console.log(`Ship ${shipId} is mining ${resourceType}`);
  },
  tradeResources: async (shipId: string, resourceType: string, amount: number, price: number): Promise<void> => {
    // Implement trading logic here
    console.log(`Ship ${shipId} is trading ${amount} of ${resourceType} at ${price}`);
  },
});

async function executePlayerScript(player: Player) {
  const vm = new VM({
    timeout: 100, // Limit execution time
    sandbox: {
      api: createPlayerAPI(player.id),
      console: {
        log: (...args: any[]) => console.log(`Player ${player.id}:`, ...args),
        error: (...args: any[]) => console.error(`Player ${player.id}:`, ...args),
      },
    },
  });

  try {
    await vm.run(`
      async function gameLoop() {
        ${player.script_code}
      }
      gameLoop().catch(error => console.error('Script error:', error.message));
    `);
  } catch (error) {
    console.error(`Error executing script for player ${player.id}:`, error);
  }
}


async function gameTick() {
    console.log('Game tick started');
    
    // Fetch all active players
    const { data: players, error } = await supabase
      .from('players')
      .select('id, script_code, script_name')
      .eq('status', 'active');
  
    if (error) {
      console.error('Error fetching players:', error);
      return;
    }
  
    // Execute each player's script
    const scriptExecutions = players.map(executePlayerScript);
    await Promise.all(scriptExecutions);
  
    // Update game state, handle collisions, etc.
    await updateGameState();
  
    console.log('Game tick completed');
  }

async function updateGameState() {
  // Implement game state updates here
  // For example: resource regeneration, AI actions, etc.
  console.log('Updating game state');
}

export function startGameLoop() {
  setInterval(gameTick, TICK_RATE);
  console.log('Game loop started');
}
