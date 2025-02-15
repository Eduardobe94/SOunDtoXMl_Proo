import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ["latin"],
  variable: "--font-jetbrains-mono" 
});

export const metadata: Metadata = {
  title: "Sound to XML Pro",
  description: "Transform audio into professional XML markers with AI precision",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <meta charSet="UTF-8" />
      </head>
      <body className={`${jetbrainsMono.variable} font-mono`}>
        <main className="min-h-screen bg-[#0a0a0a] text-gray-100 py-12">
          {children}
        </main>
      </body>
    </html>
  );
}
