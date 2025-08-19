// app/page.js
import React, { useState } from 'react';
import { Stage, Layer, Circle, Image, Line, Text } from 'react-konva';
import useImage from 'use-image';

const TABLE_WIDTH = 800;
const TABLE_HEIGHT = 400;

export default function Home() {
  const [balls, setBalls] = useState([]);
  const [selectedType, setSelectedType] = useState('white');
  const [cueBall, setCueBall] = useState('white');
  const [analysis, setAnalysis] = useState(null);
  const [path, setPath] = useState([]); // 예: AI가 제안한 경로 좌표
  const [strokePoint, setStrokePoint] = useState(null);

  const [image] = useImage('/pool_table.jpg');

  const handleCanvasClick = (e) => {
    const pos = e.target.getStage().getPointerPosition();
    const newBall = {
      x: pos.x,
      y: pos.y,
      type: selectedType,
      color: getColor(selectedType),
    };
    setBalls([...balls, newBall]);
  };

  const getColor = (type) => {
    switch (type) {
      case 'white': return 'white';
      case 'yellow': return 'yellow';
      case 'red': return 'red';
      default: return 'gray';
    }
  };

  const removeBall = (index) => {
    setBalls(balls.filter((_, i) => i !== index));
  };

  const analyze = async () => {
    const res = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cueBall, balls }),
    });

    const data = await res.json();

    if (data.path) setPath(data.path); // 예: [[x1,y1], [x2,y2]]
    if (data.strokePoint) setStrokePoint(data.strokePoint);
    setAnalysis(data.text || "분석 완료");
  };

  return (
    <div style={{ padding: 20, fontFamily: 'Arial' }}>
      <h1>🎱 당구 AI 코스 분석기</h1>
      <p>당구대 위를 클릭해서 공을 배치하세요.</p>

      <div style={{ marginBottom: 10 }}>
        <button onClick={() => setSelectedType('white')}>흰공</button>
        <button onClick={() => setSelectedType('yellow')}>노란공</button>
        <button onClick={() => setSelectedType('red')}>빨간공</button>
      </div>

      <div>
        <label>
          <input
            type="radio"
            value="white"
            checked={cueBall === 'white'}
            onChange={(e) => setCueBall(e.target.value)}
          /> 흰공이 내공
        </label>
        <label style={{ marginLeft: 10 }}>
          <input
            type="radio"
            value="yellow"
            checked={cueBall === 'yellow'}
            onChange={(e) => setCueBall(e.target.value)}
          /> 노란공이 내공
        </label>
      </div>

      <Stage
        width={TABLE_WIDTH}
        height={TABLE_HEIGHT}
        onClick={handleCanvasClick}
        style={{ border: '1px solid #ccc', marginTop: 10 }}
      >
        <Layer>
          <Image image={image} width={TABLE_WIDTH} height={TABLE_HEIGHT} />
          {balls.map((ball, i) => (
            <Circle
              key={i}
              x={ball.x}
              y={ball.y}
              radius={10}
              fill={ball.color}
              stroke="black"
              strokeWidth={1}
              onClick={() => removeBall(i)}
              draggable
              onDragEnd={(e) => {
                const newBalls = [...balls];
                newBalls[i].x = e.target.x();
                newBalls[i].y = e.target.y();
                setBalls(newBalls);
              }}
            />
          ))}

          {/* AI 추천 경로 (화살표) */}
          {path.length > 1 && (
            <Line
              points={path.flat()}
              stroke="blue"
              strokeWidth={3}
              lineCap="round"
              lineJoin="round"
              tension={0.2}
              closed={false}
            />
          )}

          {/* 당점 (타격점) */}
          {strokePoint && (
            <Circle
              x={strokePoint[0]}
              y={strokePoint[1]}
              radius={5}
              fill="red"
              opacity={0.8}
            />
          )}
        </Layer>
      </Stage>

      <button onClick={analyze} style={{ marginTop: 10 }}>
        🤖 AI 분석 요청
      </button>

      {analysis && (
        <div style={{ marginTop: 20, padding: 10, backgroundColor: '#f0f0f0', borderRadius: 5 }}>
          <h3>분석 결과</h3>
          <p>{analysis}</p>
        </div>
      )}
    </div>
  );
}
