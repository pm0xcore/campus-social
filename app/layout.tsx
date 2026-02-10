import type { Metadata } from 'next';
import { Providers } from './providers';
import { NavBar } from '@/components/NavBar';
import { Header } from '@/components/Header';
import { OnboardingGuard } from '@/components/OnboardingGuard';
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
          <OnboardingGuard>
            <Header />
            {children}
            <NavBar />
          </OnboardingGuard>
        </Providers>
      </body>
    </html>
  );
}
