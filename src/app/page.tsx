import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { getLocale } from './actions/locale'
import { dictionaries } from '@/lib/i18n/dictionaries'

export default async function Home() {
  const locale = await getLocale()
  const t = dictionaries[locale]

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center mb-8">
          <img src="/intersnack-logo.png" alt="Intersnack Logo" className="h-16 object-contain" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          {t.index.title}
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          {t.index.subtitle}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/request">
            <Button size="lg" className="w-full sm:w-auto">
              {t.index.requestBtn}
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              {t.index.loginBtn}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
