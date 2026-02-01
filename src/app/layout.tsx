import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Love Nest 💕 | Our Special Place",
  description: "A romantic memento website for couples to share memories, plan dates, and celebrate love together.",
  keywords: ["love", "couples", "memories", "valentines", "romantic"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#fff',
                color: '#1a1a2e',
                borderRadius: '1rem',
                boxShadow: '0 8px 30px rgba(244, 63, 94, 0.15)',
              },
              success: {
                iconTheme: {
                  primary: '#f43f5e',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
