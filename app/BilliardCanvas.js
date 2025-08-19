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
      <h3>공 배치: {config.name}</h3
