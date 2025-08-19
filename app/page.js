// app/page.js
import React, { useState } from 'react';
import { Stage, Layer, Circle, Rect, Text as KonvaText, Group } from 'react-konva';
import Konva from 'konva';

const TABLE_WIDTH = 800;
const TABLE_HEIGHT = 400;

// 공 색상 정의
const BALL_COLORS = {
  white: 'white',
  yellow: 'yellow',
  red: 'red',
};

// 게임별 필요 공 정의
const GAME_CONFIG = {
  three_cushion: {
    name: '3쿠션',
    tableColor: '#1a472a', // 짙은 초록
    balls: [
      { type: 'white', label: '흰공', x: 200, y: 200 },
      { type: 'yellow', label: '노란공', x: 600, y: 200 },
      { type: 'red', label: '빨간공', x: 400, y: 200 },
    ],
  },
  four_ball: {
    name: '4구',
    tableColor: '#003366', // 짙은 파랑
    balls: [
      { type: 'white', label: '흰공', x: 200, y: 200 },
      { type: 'yellow', label: '노란공', x: 600, y: 200 },
      { type: 'red', label: '빨간공1', x: 350, y: 150 },
      { type: 'red', label: '빨간공2', x: 450, y: 250 },
    ],
  },
};

export default function Home() {
  const [gameType, setGameType] = useState('three_cushion');
  const [balls, setBalls] = useState([]);
  const [cueBall, setCueBall] = useState('white'); // 내공 선택
  const [isSetupMode, setIsSetupMode] = useState(true);
  const [analysis, setAnalysis] = useState(null);
  const [path, setPath] = useState([]);
  const [strokePoint, setStrokePoint] = useState(null);

  const config = GAME_CONFIG[gameType];

  // 게임 선택 시 초기 공 배치
  const handleGameSelect = () => {
    setBalls(config.balls.map(b => ({ ...b })));
    setIsSetupMode(true);
    setAnalysis(null);
    setPath([]);
    setStrokePoint(null);
  };

  const updateBallPosition = (index, newAttrs) => {
    const newBalls = balls.map((ball, i) => (i === index ? { ...ball, ...newAttrs } : ball));
    setBalls(newBalls);
  };

  const confirmSetup = () => {
    setIsSetupMode(false);
  };

  const analyze = async () => {
    const payload = {
      cueBall,
      gameType,
      balls: balls.map(b => ({ type: b.type, x: Math.round(b.x), y: Math.round(b.y), label: b.label })),
    };

    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setAnalysis(data.text || "분석 완료");
      if (data.path) setPath(data.path);
      if (data.strokePoint) setStrokePoint(data.strokePoint);
    } catch (error) {
      setAnalysis("분석 중 오류가 발생했습니다.");
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: 'Arial, sans-serif', textAlign: 'center' }}>
      <h1>🎱 당구 AI 코스 분석기</h1>

      {isSetupMode ? (
        <>
          <div style={{ marginBottom: 20 }}>
            <label>
              <input
                type="radio"
                value="three_cushion"
                checked={gameType === 'three_cushion'}
                onChange={(e) => setGameType(e.target.value)}
              />
              &nbsp;3쿠션
            </label>
            &nbsp;&nbsp;
            <label>
              <input
                type="radio"
                value="four_ball"
                checked={gameType === 'four_ball'}
                onChange={(e) => setGameType(e.target.value)}
              />
              &nbsp;4구
            </label>
            <br />
            <button onClick={handleGameSelect} style={{ marginTop: 10 }}>
              게임 시작
            </button>
          </div>

          {balls.length > 0 && (
            <div>
              <h3>공 배치 (드래그해서 이동)</h3>
              <Stage width={TABLE_WIDTH} height={TABLE_HEIGHT}>
                <Layer>
                  {/* 당구대 */}
                  <Rect
                    x={0}
                    y={0}
                    width={TABLE_WIDTH}
                    height={TABLE_HEIGHT}
                    fill={config.tableColor}
                    shadowBlur={10}
                  />
                  {/* 공들 */}
                  {balls.map((ball, index) => (
                    <Group key={index} draggable
                           x={ball.x} y={ball.y}
                           onDragEnd={(e) => {
                             updateBallPosition(index, { x: e.target.x(), y: e.target.y() });
                           }}>
                      <Circle radius={15} fill={BALL_COLORS[ball.type]} stroke="black" strokeWidth={2} />
                      <KonvaText
                        text={ball.label}
                        fontSize={12}
                        fill="black"
                        align="center"
                        y={20}
                        width={30}
                        height={15}
                      />
                    </Group>
                  ))}
                </Layer>
              </Stage>

              <div style={{ marginTop: 20 }}>
                <label>
                  내공 선택:
                  <select value={cueBall} onChange={(e) => setCueBall(e.target.value)}>
                    {balls.map((ball, i) => (
                      <option key={i} value={ball.type}>
                        {ball.label} ({ball.type})
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <button onClick={confirmSetup} style={{ marginTop: 20, padding: '10px 20px', fontSize: '16px' }}>
                ✅ 위치 확정
              </button>
            </div>
          )}
        </>
      ) : (
        <>
          <h2>🎯 분석 요청</h2>
          <p>내공: {balls.find(b => b.type === cueBall)?.label}</p>
          <Stage width={TABLE_WIDTH} height={TABLE_HEIGHT}>
            <Layer>
              {/* 현재 배치된 당구대 및 공 */}
              <Rect
                x={0}
                y={0}
                width={TABLE_WIDTH}
                height={TABLE_HEIGHT}
                fill={config.tableColor}
              />
              {balls.map((ball, index) => (
                <Group key={index}>
                  <Circle
                    x={ball.x}
                    y={ball.y}
                    radius={15}
                    fill={BALL_COLORS[ball.type]}
                    stroke="black"
                    strokeWidth={2}
                  />
                </Group>
              ))}
              {/* AI 추천 경로 */}
              {path.length > 1 && (
                <Line
                  points={path.flat()}
                  stroke="yellow"
                  strokeWidth={4}
                  lineCap="round"
                  dash={[10, 5]}
                />
              )}
              {/* 당점 */}
              {strokePoint && (
                <Circle
                  x={strokePoint[0]}
                  y={strokePoint[1]}
                  radius={8}
                  fill="red"
                  opacity={0.8}
                  shadowBlur={10}
                />
              )}
            </Layer>
          </Stage>

          <button onClick={analyze} style={{ marginTop: 20, padding: '12px 24px', fontSize: '18px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: 5 }}>
            🤖 AI 에게 물어보기
          </button>

          {analysis && (
            <div style={{
              marginTop: 30,
              padding: 20,
              backgroundColor: '#f5f5f5',
              borderRadius: 10,
              textAlign: 'left',
              maxWidth: '800px',
              margin: '30px auto',
              border: '1px solid #ddd'
            }}>
              <h3>🧠 AI 분석 결과</h3>
              <p style={{ whiteSpace: 'pre-line' }}>{analysis}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
