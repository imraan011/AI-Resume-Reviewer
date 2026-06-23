import type { Metadata } from 'next';
import { Syne, Inter } from 'next/font/google';
import SmoothLayout from '@/components/SmoothLayout';
import CustomCursor from '@/components/CustomCursor';
import './globals.css';

// headings ke liye — bold geometric feel
const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '700', '800'],
  variable: '--font-syne',
  display: 'swap',
});

// body text ke liye — clean aur readable
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AI Resume Reviewer',
  description:
    'Get instant, AI-powered feedback on your resume. Cinematic dark UI for serious job seekers.',
};

// layout.tsx server component hi rahega — SmoothLayout client hai
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // font CSS vars + dark bg — html root pe apply ho rahe hain
    <html
      lang="en"
      className={`${syne.variable} ${inter.variable}`}
      style={{
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)',
      }}
    >
      <body>
        {/* SmoothLayout Lenis + GSAP ticker ko initialize karta hai */}
        <SmoothLayout>
          <CustomCursor />
          {children}
        </SmoothLayout>
      </body>
    </html>
  );
}
