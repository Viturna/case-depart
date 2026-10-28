import type { Metadata } from 'next';
import { Archivo, Inter, IBM_Plex_Mono } from 'next/font/google';
import '@/styles/globals.css';
import { CartProvider } from '@/context/CartContext';
import CartDrawer from '@/components/CartDrawer';

const archivo = Archivo({
  subsets: ['latin'],
  weight: ['700', '800', '900'],
  variable: '--font-archivo',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-plex-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Case Départ — Le sudoku prend un nouveau départ',
  description: 'Carnets de sudoku thématiques en PDF et jeu en ligne chronométré. Échauffement, Sprint, Marathon.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${archivo.variable} ${inter.variable} ${ibmPlexMono.variable}`}>
      <body>
        <CartProvider>
          {children}
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
