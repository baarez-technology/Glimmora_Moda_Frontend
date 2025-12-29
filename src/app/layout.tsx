import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AGIConcierge from '@/components/shared/AGIConcierge';

export const metadata: Metadata = {
  title: 'ModaGlimmora | Experience-First Luxury Commerce',
  description: 'The world\'s first AGI-native fashion universe. Experience luxury through intelligence, not transaction.',
  keywords: ['luxury fashion', 'designer brands', 'Dior', 'Gucci', 'Hermès', 'Louis Vuitton', 'fashion intelligence'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-ivory-cream">
        <Header />
        <main className="pt-[72px] lg:pt-[104px]">
          {children}
        </main>
        <Footer />
        <AGIConcierge />
      </body>
    </html>
  );
}
