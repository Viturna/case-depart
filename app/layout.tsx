import type { Metadata } from 'next';
import { Anton } from 'next/font/google';
import '@/styles/globals.css';
import { CartProvider } from '@/context/CartContext';
import CartDrawer from '@/components/CartDrawer';
import Reveal from '@/components/Reveal';
import Preloader from '@/components/Preloader';
import CustomCursor from '@/components/CustomCursor';

const anton = Anton({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-anton',
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
    <html lang="fr" className={anton.variable} suppressHydrationWarning>
      <head>
        {/* Avant le premier rendu : active les animations sauf en mouvement réduit,
            et saute le preloader s'il a déjà été vu dans la session. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(h){if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;h.classList.add('js-anim');try{if(sessionStorage.getItem('cd-pre'))h.classList.add('no-pre')}catch(e){}})(document.documentElement)`,
          }}
        />
        {/* BDO Grotesk absente de next/font en v14 : chargée depuis Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=BDO+Grotesk:wght@400;500&display=swap"
        />
      </head>
      <body>
        <Preloader />
        <CustomCursor />
        <CartProvider>
          {children}
          <CartDrawer />
        </CartProvider>
        <Reveal />
      </body>
    </html>
  );
}
