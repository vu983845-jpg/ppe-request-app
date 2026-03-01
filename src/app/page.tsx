import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FileText, UserCheck, ShieldCheck, Box, Users, Mail, MessageCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { getLocale } from './actions/locale'
import { dictionaries } from '@/lib/i18n/dictionaries'
import { ContactButtons } from '@/components/contact-buttons'

export default async function Home() {
  const locale = await getLocale()
  const t = dictionaries[locale]

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center mb-8">
          <div className="bg-white p-2 md:p-3 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800">
            <img src="/intersnack-logo.jpg" alt="Intersnack Logo" className="h-12 md:h-16 object-contain" />
          </div>
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
        <p className="text-zinc-500 dark:text-zinc-400 text-center text-sm mb-6 -mt-6">
          {t.index.timeline?.clickForDetails || "Bấm vào từng bước để xem chi tiết"}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">

          {/* Step 1 */}
          <Dialog>
            <DialogTrigger asChild>
              <button className="relative flex flex-col items-center text-center p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all hover:shadow-md hover:ring-2 hover:ring-blue-500/50 cursor-pointer focus:outline-none w-full">
                <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-white dark:border-zinc-950 bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400 shrink-0 mb-3 z-10">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-zinc-800 dark:text-zinc-100 text-sm mb-1 w-full text-center">1. {t.index.timeline?.step1?.title}</h3>
                <div className="text-zinc-500 text-xs w-full text-center">{t.index.timeline?.step1?.desc}</div>
                <div className="hidden md:block absolute top-[2.2rem] right-0 translate-x-1/2 w-[calc(100%-1rem)] h-0.5 bg-zinc-200 dark:bg-zinc-800 -z-10" />
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
                    <FileText className="w-5 h-5" />
                  </div>
                  1. {t.index.timeline?.step1?.title}
                </DialogTitle>
                <DialogDescription className="pt-4 text-base leading-relaxed text-zinc-600 dark:text-zinc-300">
                  {t.index.timeline?.step1?.fullDetail}
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>

          {/* Step 2 */}
          <Dialog>
            <DialogTrigger asChild>
              <button className="relative flex flex-col items-center text-center p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all hover:shadow-md hover:ring-2 hover:ring-amber-500/50 cursor-pointer focus:outline-none w-full">
                <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-white dark:border-zinc-950 bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-500 shrink-0 mb-3 z-10">
                  <UserCheck className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-zinc-800 dark:text-zinc-100 text-sm mb-1 w-full text-center">2. {t.index.timeline?.step2?.title}</h3>
                <div className="text-zinc-500 text-xs w-full text-center">{t.index.timeline?.step2?.desc}</div>
                <div className="hidden md:block absolute top-[2.2rem] right-0 translate-x-1/2 w-[calc(100%-1rem)] h-0.5 bg-zinc-200 dark:bg-zinc-800 -z-10" />
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-500">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  2. {t.index.timeline?.step2?.title}
                </DialogTitle>
                <DialogDescription className="pt-4 text-base leading-relaxed text-zinc-600 dark:text-zinc-300">
                  {t.index.timeline?.step2?.fullDetail}
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>

          {/* Step 3 */}
          <Dialog>
            <DialogTrigger asChild>
              <button className="relative flex flex-col items-center text-center p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all hover:shadow-md hover:ring-2 hover:ring-purple-500/50 cursor-pointer focus:outline-none w-full">
                <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-white dark:border-zinc-950 bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400 shrink-0 mb-3 z-10">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-zinc-800 dark:text-zinc-100 text-sm mb-1 w-full text-center">3. {t.index.timeline?.step3?.title}</h3>
                <div className="text-zinc-500 text-xs w-full text-center">{t.index.timeline?.step3?.desc}</div>
                <div className="hidden md:block absolute top-[2.2rem] right-0 translate-x-1/2 w-[calc(100%-1rem)] h-0.5 bg-zinc-200 dark:bg-zinc-800 -z-10" />
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  3. {t.index.timeline?.step3?.title}
                </DialogTitle>
                <DialogDescription className="pt-4 text-base leading-relaxed text-zinc-600 dark:text-zinc-300">
                  {t.index.timeline?.step3?.fullDetail}
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>

          {/* Step 4 */}
          <Dialog>
            <DialogTrigger asChild>
              <button className="relative flex flex-col items-center text-center p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all hover:shadow-md hover:ring-2 hover:ring-rose-500/50 cursor-pointer focus:outline-none w-full">
                <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-white dark:border-zinc-950 bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-500 shrink-0 mb-3 z-10">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-zinc-800 dark:text-zinc-100 text-sm mb-1 w-full text-center">4. {t.index.timeline?.step4?.title}</h3>
                <div className="text-zinc-500 text-xs w-full text-center">{t.index.timeline?.step4?.desc}</div>
                <div className="hidden md:block absolute top-[2.2rem] right-0 translate-x-1/2 w-[calc(100%-1rem)] h-0.5 bg-zinc-200 dark:bg-zinc-800 -z-10" />
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-500">
                    <Users className="w-5 h-5" />
                  </div>
                  4. {t.index.timeline?.step4?.title}
                </DialogTitle>
                <DialogDescription className="pt-4 text-base leading-relaxed text-zinc-600 dark:text-zinc-300">
                  {t.index.timeline?.step4?.fullDetail}
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>

          {/* Step 5 */}
          <Dialog>
            <DialogTrigger asChild>
              <button className="relative flex flex-col items-center text-center p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all hover:shadow-md hover:ring-2 hover:ring-green-500/50 cursor-pointer focus:outline-none w-full">
                <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-white dark:border-zinc-950 bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-500 shrink-0 mb-3 z-10">
                  <Box className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-zinc-800 dark:text-zinc-100 text-sm mb-1 w-full text-center">5. {t.index.timeline?.step5?.title}</h3>
                <div className="text-zinc-500 text-xs w-full text-center">{t.index.timeline?.step5?.desc}</div>
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-500">
                    <Box className="w-5 h-5" />
                  </div>
                  5. {t.index.timeline?.step5?.title}
                </DialogTitle>
                <DialogDescription className="pt-4 text-base leading-relaxed text-zinc-600 dark:text-zinc-300">
                  {t.index.timeline?.step5?.fullDetail}
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>

        </div>
      </div>

      {/* Support Contact */}
      <div className="mt-16 mb-12 flex justify-center animate-in zoom-in-95 duration-700 delay-300">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="rounded-full shadow-sm hover:shadow-md transition-all gap-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 px-6">
              <MessageCircle className="w-5 h-5" />
              <span>{t.index.contact?.title || "Cần Hỗ Trợ?"}</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md text-center">
            <DialogHeader>
              <DialogTitle className="text-center">{t.index.contact?.title || "Cần Hỗ Trợ?"}</DialogTitle>
              <DialogDescription className="text-center pt-2 pb-4">
                {t.index.contact?.desc || "Liên hệ với chúng tôi qua:"}
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-center pb-4">
              <ContactButtons
                email="vu.huynh@intersnack.com.vn"
                phone="0945 646 999"
                emailLabel={t.index.contact?.email || "Email Support"}
                phoneLabel={t.index.contact?.phone || "Zalo / Hotline"}
                revealText={t.index.contact?.reveal || "Show Info"}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>

    </div>
  )
}
