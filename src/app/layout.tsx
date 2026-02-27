import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { getLocale } from './actions/locale'
import { LanguageProvider } from '@/lib/i18n/context'
import { LanguageSwitcher } from '@/components/language-switcher'
import Link from 'next/link'
import Image from 'next/image'

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
            <header className="border-b bg-white dark:bg-zinc-950/50 sticky top-0 z-50">
              <div className="container mx-auto px-4 h-16 flex items-center">
                <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                  <div className="relative w-32 h-10">
                    <Image
                      src="/logo.png"
                      alt="Intersnack Logo"
                      fill
                      className="object-contain object-left"
                      priority
                    />
                  </div>
                </Link>
              </div>
            </header>

            <main className="flex-1">
              {children}
            </main>
            <footer className="border-t bg-white dark:bg-zinc-950/50 py-4">
              <div className="container mx-auto px-4 flex flex-col items-center justify-between gap-2 md:h-12 md:flex-row">
                <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
                  &copy; {new Date().getFullYear()} Intersnack Vietnam.
                </p>
                <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 font-medium whitespace-nowrap">
                  Designed & Built by Vu.Huynh
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
