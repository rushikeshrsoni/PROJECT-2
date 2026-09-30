import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AetherOps AI | Autonomous Cloud Infrastructure Incident Remediation Engine',
  description: 'Automatically diagnose, isolate, and fix critical cloud outages using Agentic ReAct cycles. Deep space cyberpunk autonomous reliability engineering.',
  keywords: [
    'Autonomous SRE',
    'Cloud Incident Remediation',
    'ReAct Agent',
    'AetherOps AI',
    'DevOps AI',
    'Self-Healing Infrastructure'
  ],
  authors: [{ name: 'AetherOps AI Engineering Team' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} dark`}>
      <body className="min-h-screen bg-[#030712] text-slate-100 antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
