import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FileText, UserCheck, ShieldCheck, Box } from 'lucide-react'
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
          <Link href="/tracking">
            <Button size="lg" variant="secondary" className="w-full sm:w-auto bg-blue-100 hover:bg-blue-200 text-blue-900 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800">
              {t.index.trackBtn}
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              {t.index.loginBtn}
            </Button>
          </Link>
        </div>
      </div>

      {/* 4-Step Process Timeline */}
      <div className="mt-16 text-left pt-8 border-t border-zinc-200 dark:border-zinc-800 animate-in fade-in duration-700 delay-150">
        <h2 className="text-xl font-semibold text-center mb-8 text-zinc-800 dark:text-zinc-200">
          {t.index.timeline?.title || "Quy Trình 4 Bước"}
        </h2>
        <div className="space-y-6 max-w-sm mx-auto relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-zinc-200 dark:before:via-zinc-800 before:to-transparent">
          {/* Step 1 */}
          <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-zinc-950 bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
              <FileText className="w-4 h-4" />
            </div>
            <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-zinc-800 dark:text-zinc-100 text-sm">1. {t.index.timeline?.step1?.title}</h3>
              </div>
              <div className="text-zinc-500 text-xs">{t.index.timeline?.step1?.desc}</div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-zinc-950 bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
              <UserCheck className="w-4 h-4" />
            </div>
            <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-zinc-800 dark:text-zinc-100 text-sm">2. {t.index.timeline?.step2?.title}</h3>
              </div>
              <div className="text-zinc-500 text-xs">{t.index.timeline?.step2?.desc}</div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-zinc-950 bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-zinc-800 dark:text-zinc-100 text-sm">3. {t.index.timeline?.step3?.title}</h3>
              </div>
              <div className="text-zinc-500 text-xs">{t.index.timeline?.step3?.desc}</div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-zinc-950 bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
              <Box className="w-4 h-4" />
            </div>
            <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-zinc-800 dark:text-zinc-100 text-sm">4. {t.index.timeline?.step4?.title}</h3>
              </div>
              <div className="text-zinc-500 text-xs">{t.index.timeline?.step4?.desc}</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
