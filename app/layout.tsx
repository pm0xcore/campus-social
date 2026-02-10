import type { Metadata } from 'next';
import { Providers } from './providers';
import { NavBar } from '@/components/NavBar';
import { Header } from '@/components/Header';
import './globals.css';

export const metadata: Metadata = {
  title: 'Campus Social',
  description: 'Connect with your university community on Open Campus',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full pt-14 pb-16">
        <Providers>
          <Header />
          {children}
          <NavBar />
        </Providers>
      </body>
    </html>
  );
}
