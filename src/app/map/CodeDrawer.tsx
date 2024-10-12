'use client';

import React, { useState } from 'react';

const CodeDrawer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [code, setCode] = useState('');

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: isOpen ? '300px' : '30px',
        backgroundColor: '#1e1e1e',
        transition: 'height 0.3s ease-in-out',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          padding: '5px',
          cursor: 'pointer',
          textAlign: 'center',
          backgroundColor: '#2d2d2d',
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? 'Close Code Editor' : 'Open Code Editor'}
      </div>
      {isOpen && (
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          style={{
            width: '100%',
            height: 'calc(100% - 30px)',
            backgroundColor: '#1e1e1e',
            color: 'white',
            border: 'none',
            padding: '10px',
            resize: 'none',
          }}
          placeholder="Enter your code here..."
        />
      )}
    </div>
  );
};

export default CodeDrawer;

