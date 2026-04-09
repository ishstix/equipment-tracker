import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Equipment Tracker',
  description: 'Check out and manage equipment inventory',
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
