import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SrcLens - 리액트 코드 분석기",
  description: "리액트 왕초보를 위한 page.tsx 1분 분석기",
  openGraph: {
    title: "SrcLens - 리액트 코드 분석기",
    description: "AI 없이 · 인터넷 없이 · 즉시 분석",
    type: "website",
    locale: "ko_KR",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-gray-950">{children}</body>
    </html>
  );
}
