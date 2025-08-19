// app/api/gemini/route.js
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = 'edge'; // Vercel Edge Runtime 사용 가능

export async function POST(request) {
  const { cueBall, balls } = await request.json();

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  const prompt = `
당구대 위에 공이 다음과 같이 배치되어 있습니다:
- 내공: ${cueBall === 'white' ? '흰공' : '노란공'}
- 공들: ${balls.map(b => `${b.type} (${Math.round(b.x)}, ${Math.round(b.y)})`).join(', ')}

당신은 세계적인 당구 전문가입니다.
이 상황에서 가장 이상적인 코스를 분석해주세요.
- 타격할 당점 (좌표 추정)
- 방향 화살표 경로 (시작점과 반사점 좌표 예시)
- 어떤 공을 먼저 맞추는지
- 몇 쿠션 사용하는지

결과를 JSON 형식으로만 출력하세요:
{
  "text": "설명 텍스트",
  "strokePoint": [x, y],
  "path": [[x1, y1], [x2, y2], [x3, y3]]
}

좌표는 당구대 크기(800x400) 기준입니다.
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // 코드 블록 제거
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    const parsed = JSON.parse(text);

    // 안전하게 좌표 제한
    parsed.strokePoint = parsed.strokePoint?.map(n => Math.max(0, Math.min(800, n)));
    parsed.path = parsed.path?.map(p => [
      Math.max(0, Math.min(800, p[0])),
      Math.max(0, Math.min(400, p[1]))
    ]);

    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Gemini API Error:", error);
    return new Response(
      JSON.stringify({
        text: "분석 중 오류가 발생했습니다.",
        strokePoint: null,
        path: []
      }),
      { status: 500 }
    );
  }
}
