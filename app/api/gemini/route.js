// app/api/gemini/route.js
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = 'edge';

export async function POST(request) {
  const { cueBall, gameType, balls } = await request.json();
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  const prompt = `
당구 게임: ${gameType === 'three_cushion' ? '3쿠션' : '4구'}
내공: ${cueBall}
공 배치:
${balls.map(b => `- ${b.label} (${b.type}): (${b.x}, ${b.y})`).join('\n')}

당신은 세계적인 당구 전문가입니다.
이 상황에서 최적의 코스를 분석해주세요.
- 타격할 당점 좌표 (추정)
- 경로 (화살표 방향, 쿠션 반사 예측)
- 어떤 공을 먼저 맞추는지
- 몇 쿠션 코스인지

결과를 아래 JSON 형식으로만 응답하세요:
{
  "text": "설명 텍스트 (2~3문장)",
  "strokePoint": [x, y],
  "path": [[x1, y1], [x2, y2], [x3, y3]]
}
모든 좌표는 800x400 크기 기준입니다.
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(text);

    // 좌표 보정
    const clamp = (val, min, max) => Math.max(min, Math.min(max, val));
    if (parsed.strokePoint) {
      parsed.strokePoint = [clamp(parsed.strokePoint[0], 0, 800), clamp(parsed.strokePoint[1], 0, 400)];
    }
    if (parsed.path) {
      parsed.path = parsed.path.map(p => [clamp(p[0], 0, 800), clamp(p[1], 0, 400)]);
    }

    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        text: "분석 실패: 입력을 다시 확인해 주세요.",
        strokePoint: null,
        path: []
      }),
      { status: 500 }
    );
  }
}
