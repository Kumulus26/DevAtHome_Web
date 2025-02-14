import { Inter } from 'next/font/google';
import { Oswald } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import { ThemeProvider } from './ThemeContext'

const inter = Inter({ subsets: ['latin'] });
const oswald = Oswald({
  subsets: ['latin'],
  variable: '--font-oswald',
  display: 'swap',
});

export const metadata = {
  title: 'DevAtHome',
  description: 'Your Black & White films deserve the best',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${oswald.variable}`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
