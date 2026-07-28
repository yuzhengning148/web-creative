import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mocha Cat Studio | 咖啡色的猫 · Mixed Creative Portfolio",
  description:
    "Mocha Cat Studio（咖啡色的猫）是一个记录网页、视觉、影像、动效与创作实验的个人混合作品集。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
