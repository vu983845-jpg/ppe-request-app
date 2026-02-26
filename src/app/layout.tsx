import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Intersnack PPE Request Management',
  description: 'Manage PPE requests dynamically.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex flex-col min-h-screen">
          <main className="flex-1">
            {children}
          </main>
          <footer className="border-t bg-white dark:bg-zinc-950/50 py-4">
            <div className="container mx-auto px-4 flex flex-col items-center justify-between gap-2 md:h-12 md:flex-row">
              <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
                &copy; {new Date().getFullYear()} Intersnack Vietnam.
              </p>
              <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                Designed & Built by Vu.Huynh
              </p>
            </div>
          </footer>
        </div>
        <Toaster />
      </body>
    </html>
  )
}
