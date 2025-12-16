import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ApolloWrapper } from '@/lib/apollo-wrapper';
import { AuthProvider } from '@/components/AuthProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Система управления событиями',
  description: 'Управляйте и открывайте события',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        <ApolloWrapper>
          <AuthProvider>{children}</AuthProvider>
        </ApolloWrapper>
      </body>
    </html>
  );
}

