'use client'; // ✅ 이 한 줄이 핵심!

import { useState } from 'react';
import dynamic from 'next/dynamic';

// ✅ 클라이언트 전용 컴포넌트를 다이나믹 임포트
const DynamicBilliardCanvas = dynamic(() => import('./BilliardCanvas'), {
  ssr: false,
  loading: () => <p>당구대를 준비 중...</p>,
});

const GAME_CONFIG = {
  three_cushion: {
    name: '3쿠션',
    tableColor: '#1a472a',
    balls: [
      { type: 'white', label: '흰공', x: 200, y: 200 },
      { type: 'yellow', label: '노란공', x: 600, y: 200 },
      { type: 'red', label: '빨간공', x: 400, y: 200 },
    ],
  },
  four_ball: {
    name: '4구',
    tableColor: '#003366',
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
  const [cueBall, setCueBall] = useState('white');
  const [isSetupMode, setIsSetupMode] = useState(true);
  const [analysis, setAnalysis] = useState(null);

  const handleGameSelect = () => {
    setBalls(GAME_CONFIG[gameType].balls.map(b => ({ ...b })));
    setIsSetupMode(true);
    setAnalysis(null);
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
      setAnalysis(data);
    } catch (error) {
      setAnalysis({ text: "분석 중 오류 발생" });
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
            <>
              <DynamicBilliardCanvas
                gameType={gameType}
                balls={balls}
                onBallsChange={setBalls}
                cueBall={cueBall}
                analysis={analysis}
                onAnalyze={analyze}
              />

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
            </>
          )}
        </>
      ) : (
        <>
          <h2>🎯 AI 분석 요청</h2>
          <p>내공: {balls.find(b => b.type === cueBall)?.label}</p>

          <DynamicBilliardCanvas
            gameType={gameType}
            balls={balls}
            onBallsChange={setBalls}
            cueBall={cueBall}
            analysis={analysis}
          />

          <button onClick={analyze} style={{
            marginTop: 20,
            padding: '12px 24px',
            fontSize: '18px',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: 5,
            cursor: 'pointer'
          }}>
            🤖 AI 에게 물어보기
          </button>

          {analysis?.text && (
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
              <p style={{ whiteSpace: 'pre-line' }}>{analysis.text}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
