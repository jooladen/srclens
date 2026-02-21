import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SrcLens - 리액트 코드 분석기",
  description: "리액트 왕초보를 위한 page.tsx 1분 분석기",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-gray-950">{children}</body>
    </html>
  );
}
