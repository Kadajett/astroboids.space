'use client';

import React from 'react';
import GameMap from './GameMap';
import CodeDrawer from './CodeDrawer';

const GamePage: React.FC = () => {
  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }} className='flex flex-col bg-black'>
      <GameMap />
      <CodeDrawer />
    </div>
  );
};

export default GamePage;

