import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Elyx Health Dashboard",
  description: "AI-powered member journey analytics and health plan tracking",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
