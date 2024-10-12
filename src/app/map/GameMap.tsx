'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import CanvasStore from '~/lib/CanvasStore';

interface Ship {
  id: string;
  x: number;
  y: number;
  playerId: string;
}

interface Resource {
  type: string;
  amount: number;
}

interface Sector {
  x: number;
  y: number;
  resources: Resource[];
}

interface GameState {
  ships: Ship[];
  sectors: Sector[];
}

const SECTOR_SIZE = 100; // 100x100 subdivisions per sector
const SUBSECTOR_SIZE = 10; // 10x10 pixels per subsector
const POLL_INTERVAL = 60000; // Poll every 60 seconds (adjust as needed)

const GameMap: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const context = canvas.getContext('2d');
      setCtx(context);
      CanvasStore.initialize(canvas.width, canvas.height);
    }

    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
        CanvasStore.initialize(window.innerWidth, window.innerHeight);
        drawMap();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchGameState = async () => {
      try {
        const response = await fetch('/api/gameState');
        const newState = await response.json();
        setGameState(newState);
      } catch (error) {
        console.error('Error fetching game state:', error);
      }
    };

    fetchGameState();
    const intervalId = setInterval(fetchGameState, POLL_INTERVAL);
    return () => clearInterval(intervalId);
  }, []);

  const drawMap = useCallback(() => {
    if (!ctx) return;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    const { x: cameraX, y: cameraY } = CanvasStore.camera;
    const { width: screenWidth, height: screenHeight } = CanvasStore.screen;

    // Draw grid
    ctx.strokeStyle = 'rgba(100, 100, 100, 0.5)';
    ctx.lineWidth = 0.5;

    // Draw subsector grid
    for (let x = -cameraX % SUBSECTOR_SIZE; x < screenWidth; x += SUBSECTOR_SIZE) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, screenHeight);
      ctx.stroke();
    }
    for (let y = -cameraY % SUBSECTOR_SIZE; y < screenHeight; y += SUBSECTOR_SIZE) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(screenWidth, y);
      ctx.stroke();
    }

    // Draw sector grid
    ctx.strokeStyle = 'rgba(200, 200, 200, 0.8)';
    ctx.lineWidth = 1;
    for (let x = -cameraX % SECTOR_SIZE; x < screenWidth; x += SECTOR_SIZE) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, screenHeight);
      ctx.stroke();
    }
    for (let y = -cameraY % SECTOR_SIZE; y < screenHeight; y += SECTOR_SIZE) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(screenWidth, y);
      ctx.stroke();
    }

    // Draw game objects based on gameState
    if (gameState) {
      drawGameObjects();
    }
  }, [ctx, gameState]);

  useEffect(() => {
    drawMap();
  }, [drawMap]);

  const drawGameObjects = () => {
    if (!ctx || !gameState) return;

    const { x: cameraX, y: cameraY } = CanvasStore.camera;
    const { width: screenWidth, height: screenHeight } = CanvasStore.screen;

    // Draw ships
    gameState.ships.forEach(ship => {
      const shipSubsectorX = Math.floor(ship.x / SUBSECTOR_SIZE) * SUBSECTOR_SIZE;
      const shipSubsectorY = Math.floor(ship.y / SUBSECTOR_SIZE) * SUBSECTOR_SIZE;
      const shipScreenX = shipSubsectorX - cameraX + screenWidth / 2 + SUBSECTOR_SIZE / 2;
      const shipScreenY = shipSubsectorY - cameraY + screenHeight / 2 + SUBSECTOR_SIZE / 2;

      ctx.fillStyle = ship.playerId === 'player1' ? 'blue' : 'red';
      ctx.beginPath();
      ctx.arc(shipScreenX, shipScreenY, SUBSECTOR_SIZE / 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw sectors and resources
    gameState.sectors.forEach(sector => {
      const sectorScreenX = sector.x * SECTOR_SIZE - cameraX + screenWidth / 2;
      const sectorScreenY = sector.y * SECTOR_SIZE - cameraY + screenHeight / 2;

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.strokeRect(sectorScreenX, sectorScreenY, SECTOR_SIZE, SECTOR_SIZE);

      ctx.fillStyle = 'white';
      ctx.font = '12px Arial';
      ctx.fillText(`${sector.x},${sector.y}`, sectorScreenX + 5, sectorScreenY + 15);

      // Draw resources in subsectors
      sector.resources.forEach(resource => {
        const resourceX = sectorScreenX + (resource.x % SECTOR_SIZE);
        const resourceY = sectorScreenY + (resource.y % SECTOR_SIZE);

        ctx.fillStyle = getResourceColor(resource.type);
        ctx.fillRect(resourceX, resourceY, SUBSECTOR_SIZE, SUBSECTOR_SIZE);

        ctx.fillStyle = 'black';
        ctx.font = '8px Arial';
        ctx.fillText(resource.amount.toString(), resourceX + 2, resourceY + 8);
      });
    });
  };

  const getResourceColor = (resourceType: string): string => {
    switch (resourceType) {
      case 'metal': return 'gray';
      case 'energy': return 'yellow';
      case 'crystal': return 'cyan';
      case 'gas': return 'green';
      default: return 'white';
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setLastPosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;

    const dx = e.clientX - lastPosition.x;
    const dy = e.clientY - lastPosition.y;

    CanvasStore.moveCamera(-dx, -dy);
    setLastPosition({ x: e.clientX, y: e.clientY });
    drawMap();
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    />
  );
};

export default GameMap;
