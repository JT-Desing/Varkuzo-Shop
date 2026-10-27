import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MotionInit } from '@/components/motion-init';

export const metadata: Metadata = {
  title: 'Varkuzo — Ropa con carácter',
  description: 'Moda urbana de Medellín. Explora Varkuzo.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body><MotionInit /><Header />{children}<Footer /></body></html>;
}
