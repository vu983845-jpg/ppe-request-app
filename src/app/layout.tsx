import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { getLocale } from './actions/locale'
import { LanguageProvider } from '@/lib/i18n/context'
import { LanguageSwitcher } from '@/components/language-switcher'
import Link from 'next/link'
import { GlobalHeader } from '@/components/global-header'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Intersnack PPE Request Management',
  description: 'Manage PPE requests dynamically.',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const initialLocale = await getLocale()

  return (
    <html lang="en">
      <body className={inter.className}>
        <LanguageProvider initialLocale={initialLocale}>
          <div className="flex flex-col min-h-screen">
            {/* Global Header */}
            <GlobalHeader />

            <main className="flex-1">
              {children}
            </main>
            <footer className="border-t bg-white dark:bg-zinc-950/50 py-4">
              <div className="container mx-auto px-4 flex flex-col items-center justify-between gap-2 md:h-12 md:flex-row">
                <p className="text-zinc-500 mb-2 md:mb-0 text-center text-sm">
                  &copy; {new Date().getFullYear()} Intersnack Vietnam. All rights reserved.
                </p>
                <p className="text-zinc-500 dark:text-zinc-400 font-medium tracking-wide text-sm whitespace-nowrap">
                  Designed & Built by V.H
                </p>
                <div className="ml-0 md:ml-auto">
                  <LanguageSwitcher />
                </div>
              </div>
            </footer>
          </div>
          <Toaster />
        </LanguageProvider>
      </body>
    </html>
  )
}
