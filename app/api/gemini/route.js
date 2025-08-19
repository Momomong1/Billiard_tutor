import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = 'edge';

export async function POST(request) {
  const { cueBall, gameType, balls } = await request.json();
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  const prompt = `
게임 종류: ${gameType}
내공: ${cueBall}
공 좌표: ${JSON.stringify(balls)}

최적의 코스를 JSON으로만 응답:
{
  "text": "설명",
  "strokePoint": [x,y],
  "path": [[x1,y1],[x2,y2]]
}`;

  try {
    const result = await model.generateContent(prompt);
    let text = result.response.text();
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return new Response(text, { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ text: "분석 실패", strokePoint: null, path: [] }), { status: 500 });
  }
}
