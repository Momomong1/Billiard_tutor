'use client';

import React, { useState } from 'react';
import { Stage, Layer, Circle, Rect, Line } from 'react-konva';

const TABLE_WIDTH = 800;
const TABLE_HEIGHT = 400;

export default function BilliardCanvas({ gameType, balls, onBallsChange, cueBall, analysis }) {
  const [selectedType, setSelectedType] = useState('white');
  const config = {
    three_cushion: { tableColor: '#1a472a', name: '3쿠션' },
    four_ball: { tableColor: '#003366', name: '4구' }
  }[gameType] || { tableColor: '#1a472a' };

  const handleCanvasClick = (e) => {
    const pos = e.target.getStage().getPointerPosition();
    const newBall = {
      x: pos.x,
      y: pos.y,
      type: selectedType,
      label: `${selectedType === 'white' ? '흰공' : selectedType === 'yellow' ? '노란공' : '빨간공'}`
    };
    onBallsChange([...balls, newBall]);
  };

  const removeBall = (index) => {
    const newBalls = balls.filter((_, i) => i !== index);
    onBallsChange(newBalls);
  };

  return (
    <div>
      <h3>공 배치: {config.name}</h3>
      <div style={{ marginBottom: 10 }}>
        <button onClick={() => setSelectedType('white')}>흰공</button>
        <button onClick={() => setSelectedType('yellow')}>노란공</button>
        <button onClick={() => setSelectedType('red')}>빨간공</button>
      </div>

      <Stage
        width={TABLE_WIDTH}
        height={TABLE_HEIGHT}
        onClick={handleCanvasClick}
        style={{ border: '1px solid #ccc', margin: '0 auto' }}
      >
        <Layer>
          <Rect width={TABLE_WIDTH} height={TABLE_HEIGHT} fill={config.tableColor} />
          {balls.map((ball, i) => (
            <Circle
              key={i}
              x={ball.x}
              y={ball.y}
              radius={15}
              fill={
                ball.type === 'white' ? 'white' :
                ball.type === 'yellow' ? 'yellow' : 'red'
              }
              stroke="black"
              strokeWidth={2}
              draggable
              onClick={() => removeBall(i)}
              onDragEnd={(e) => {
                const newBalls = [...balls];
                newBalls[i].x = e.target.x();
                newBalls[i].y = e.target.y();
                onBallsChange(newBalls);
              }}
            />
          ))}
          {analysis?.path && analysis.path.length > 1 && (
            <Line
              points={analysis.path.flat()}
              stroke="yellow"
              strokeWidth={4}
              lineCap="round"
              dash={[10, 5]}
            />
          )}
          {analysis?.strokePoint && (
            <Circle
              x={analysis.strokePoint[0]}
              y={analysis.strokePoint[1]}
              radius={8}
              fill="red"
              opacity={0.8}
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
}
