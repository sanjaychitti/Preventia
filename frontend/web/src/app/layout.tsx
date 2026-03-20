import type { Metadata } from 'next';
import './globals.css';
import Providers from './providers';

export const metadata: Metadata = {
  title: 'Preventia — Doctor Dashboard',
  description: 'Telemedicine platform for NRI healthcare',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="text-gray-900 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
