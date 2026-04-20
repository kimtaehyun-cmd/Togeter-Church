import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "함께가는교회 | Together Church",
  description: "서울시 도봉구 도당로 118에 위치한 함께가는교회입니다. 예배 안내, 설교 다시보기, 교회 소식과 커뮤니티를 확인하세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full flex flex-col antialiased">
        {children}
      </body>
    </html>
  );
}
