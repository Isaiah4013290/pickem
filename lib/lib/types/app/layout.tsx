import type { Metadata } from 'next'
import { Syne, DM_Sans } from 'next/font/google'
import './globals.css'

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  weight: ['400', '600', '700', '800'],
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm',
})

export const metadata: Metadata = {
  title: "Pick'em — High School Sports Predictions",
  description: 'Free high school sports predictions. For fun only. No money involved.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable}`}>
      <body className="bg-slate-950 text-slate-100 antialiased min-h-screen" style={{ fontFamily: 'var(--font-dm)' }}>
        {children}
      </body>
    </html>
  )
}
