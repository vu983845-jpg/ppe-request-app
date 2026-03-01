import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FileText, UserCheck, ShieldCheck, Box, Users, Mail, MessageCircle } from 'lucide-react'
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

      {/* 5-Step Process Timeline */}
      <div className="mt-16 w-full max-w-6xl text-left pt-8 border-t border-zinc-200 dark:border-zinc-800 animate-in fade-in duration-700 delay-150">
        <h2 className="text-2xl font-semibold text-center mb-8 text-zinc-800 dark:text-zinc-200">
          {t.index.timeline?.title || "Quy Trình Xử Lý"}
        </h2>

        {/* Horizontal on md+, Vertical on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">

          {/* Step 1 */}
          <div className="relative flex flex-col items-center text-center p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-white dark:border-zinc-950 bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400 shrink-0 mb-3 z-10">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-zinc-800 dark:text-zinc-100 text-sm mb-1">1. {t.index.timeline?.step1?.title}</h3>
            <div className="text-zinc-500 text-xs">{t.index.timeline?.step1?.desc}</div>

            {/* Connecting Line (Right) - Hidden on mobile */}
            <div className="hidden md:block absolute top-[2.2rem] right-0 translate-x-1/2 w-[calc(100%-1rem)] h-0.5 bg-zinc-200 dark:bg-zinc-800 -z-10" />
          </div>

          {/* Step 2 */}
          <div className="relative flex flex-col items-center text-center p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-white dark:border-zinc-950 bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-500 shrink-0 mb-3 z-10">
              <UserCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-zinc-800 dark:text-zinc-100 text-sm mb-1">2. {t.index.timeline?.step2?.title}</h3>
            <div className="text-zinc-500 text-xs">{t.index.timeline?.step2?.desc}</div>

            {/* Connecting Line (Right) - Hidden on mobile */}
            <div className="hidden md:block absolute top-[2.2rem] right-0 translate-x-1/2 w-[calc(100%-1rem)] h-0.5 bg-zinc-200 dark:bg-zinc-800 -z-10" />
          </div>

          {/* Step 3 */}
          <div className="relative flex flex-col items-center text-center p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-white dark:border-zinc-950 bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400 shrink-0 mb-3 z-10">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-zinc-800 dark:text-zinc-100 text-sm mb-1">3. {t.index.timeline?.step3?.title}</h3>
            <div className="text-zinc-500 text-xs">{t.index.timeline?.step3?.desc}</div>

            {/* Connecting Line (Right) - Hidden on mobile */}
            <div className="hidden md:block absolute top-[2.2rem] right-0 translate-x-1/2 w-[calc(100%-1rem)] h-0.5 bg-zinc-200 dark:bg-zinc-800 -z-10" />
          </div>

          {/* Step 4 */}
          <div className="relative flex flex-col items-center text-center p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-white dark:border-zinc-950 bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-500 shrink-0 mb-3 z-10">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-zinc-800 dark:text-zinc-100 text-sm mb-1">4. {t.index.timeline?.step4?.title}</h3>
            <div className="text-zinc-500 text-xs">{t.index.timeline?.step4?.desc}</div>

            {/* Connecting Line (Right) - Hidden on mobile */}
            <div className="hidden md:block absolute top-[2.2rem] right-0 translate-x-1/2 w-[calc(100%-1rem)] h-0.5 bg-zinc-200 dark:bg-zinc-800 -z-10" />
          </div>

          {/* Step 5 */}
          <div className="relative flex flex-col items-center text-center p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-white dark:border-zinc-950 bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-500 shrink-0 mb-3 z-10">
              <Box className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-zinc-800 dark:text-zinc-100 text-sm mb-1">5. {t.index.timeline?.step5?.title}</h3>
            <div className="text-zinc-500 text-xs">{t.index.timeline?.step5?.desc}</div>
          </div>

        </div>
      </div>

      {/* Support Contact */}
      <div className="mt-16 w-full max-w-3xl text-center py-8 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm animate-in zoom-in-95 duration-700 delay-300 mb-12">
        <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-200 mb-2">
          {t.index.contact?.title || "Cần Hỗ Trợ?"}
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400 mb-6 text-sm">
          {t.index.contact?.desc || "Liên hệ với chúng tôi qua:"}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="mailto:vu.huynh@intersnack.com.vn"
            className="flex items-center gap-3 px-6 py-3 rounded-full bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 transition-colors border border-zinc-200 dark:border-zinc-700 w-full sm:w-auto"
          >
            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full">
              <Mail className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="text-xs text-zinc-500 dark:text-zinc-400 leading-tight">Email Support</div>
              <div className="font-medium text-sm">vu.huynh@intersnack.com.vn</div>
            </div>
          </a>

          <a
            href="https://zalo.me/0945646999"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-6 py-3 rounded-full bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 transition-colors border border-zinc-200 dark:border-zinc-700 w-full sm:w-auto"
          >
            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="text-xs text-zinc-500 dark:text-zinc-400 leading-tight">Zalo / Hotline</div>
              <div className="font-medium text-sm">0945 646 999</div>
            </div>
          </a>
        </div>
      </div>

    </div>
  )
}
