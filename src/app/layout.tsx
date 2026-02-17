import type { Metadata } from 'next';
import './globals.css';
import ConditionalLayout from '@/components/layout/ConditionalLayout';
import ToastContainer from '@/components/shared/Toast';
import { AppProvider } from '@/context/AppContext';
import { AuthProvider } from '@/context/AuthContext';

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
        <AuthProvider>
          <AppProvider>
            <ConditionalLayout>
              {children}
            </ConditionalLayout>
            <ToastContainer />
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
