import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NISHIGPT — Sports Content Creator Studio',
  description: 'AI-powered content intelligence, scraping, and script studio for sports creators.',
  applicationName: 'NISHIGPT',
  appleWebApp: {
    capable: true,
    title: 'NISHIGPT',
    statusBarStyle: 'black-translucent',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0a0d14',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="bg-[#0a0d14] text-gray-100 antialiased selection:bg-pink-500 selection:text-white pb-20 md:pb-8">
        {children}
      </body>
    </html>
  );
}
