import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { PersistentDialer } from '../components/PersistentDialer';

export const metadata: Metadata = {
  title: 'NEET UG Counselling 2025–2026 | MCC AIQ 15%, State 85% & Deemed Predictor',
  description: 'Deterministic NEET UG Medical Seat Allocation Engine, Historical MCC Cutoffs, College Predictor, Hospital Stats & 1-on-1 Doctor Mentorship.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col antialiased selection:bg-emerald-500 selection:text-white">
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <PersistentDialer />
        <Footer />
      </body>
    </html>
  );
}
