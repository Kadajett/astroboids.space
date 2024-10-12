import { NextResponse } from 'next/server';

interface Ship {
  id: string;
  x: number;
  y: number;
  playerId: string;
}

interface Sector {
  x: number;
  y: number;
  resources: {
    type: string;
    amount: number;
  }[];
}

interface GameState {
  ships: Ship[];
  sectors: Sector[];
}

export async function GET() {
  // In a real scenario, this data would come from a database
  const gameState: GameState = {
    ships: [
      { id: '1', x: 100, y: 100, playerId: 'player1' },
      { id: '2', x: -200, y: 300, playerId: 'player2' },
      { id: '3', x: 500, y: -150, playerId: 'player1' },
    ],
    sectors: [
      {
        x: 0,
        y: 0,
        resources: [
          { type: 'metal', amount: 1000 },
          { type: 'energy', amount: 500 },
        ],
      },
      {
        x: 1,
        y: 0,
        resources: [
          { type: 'crystal', amount: 750 },
          { type: 'gas', amount: 250 },
        ],
      },
      {
        x: 0,
        y: 1,
        resources: [
          { type: 'metal', amount: 500 },
          { type: 'energy', amount: 1000 },
        ],
      },
    ],
  };

  return NextResponse.json(gameState);
}

