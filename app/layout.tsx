import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BAC Expert Bot — Accreditation Intelligence Platform",
  description:
    "AI-powered BAC accreditation documentation pre-evaluation system for Bangladeshi universities",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
