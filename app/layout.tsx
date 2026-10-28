import type { Metadata } from 'next';
import './globals.css';
import './brand-display.css';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MotionInit } from '@/components/motion-init';
import { NewsletterPopup } from '@/components/newsletter-popup';

export const metadata: Metadata = {
  title: 'Varkuzo | Ropa urbana creada desde Medellín',
  description: 'Conoce Varkuzo: buzos, camisetas y pantalones de estilo urbano inspirados en el barrio de Medellín. Explora las primeras piezas de la marca.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body><MotionInit /><Header />{children}<Footer /><NewsletterPopup /></body></html>;
}
