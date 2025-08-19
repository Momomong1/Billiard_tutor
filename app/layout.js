// app/layout.js
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: '🎱 당구 AI 코스 분석기',
  description: '공 배치 → AI 분석 → 최적 코스 추천',
};

export default function Layout({ children }) {
  return (
    <html lang="ko">
      <body className={inter.className} style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}
