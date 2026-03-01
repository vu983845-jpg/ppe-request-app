'use client'

import { useLanguage } from '@/lib/i18n/context'
import { Button } from '@/components/ui/button'

export function LanguageSwitcher() {
    const { locale, setLocale } = useLanguage()

    return (
        <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mr-1 hidden sm:inline-block">Ngôn ngữ:</span>
            <Button
                variant={locale === 'vi' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLocale('vi')}
                className="px-2 py-1 h-8 text-xs font-medium flex items-center gap-1.5 transition-all"
            >
                <span className="text-base leading-none">🇻🇳</span> VN
            </Button>
            <Button
                variant={locale === 'en' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLocale('en')}
                className="px-2 py-1 h-8 text-xs font-medium flex items-center gap-1.5 transition-all"
            >
                <span className="text-base leading-none">🇬🇧</span> ENG
            </Button>
        </div>
    )
}
