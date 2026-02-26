'use client'

import { useLanguage } from '@/lib/i18n/context'
import { Button } from '@/components/ui/button'

export function LanguageSwitcher() {
    const { locale, setLocale } = useLanguage()

    return (
        <div className="flex items-center gap-2">
            <Button
                variant={locale === 'vi' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLocale('vi')}
                className="px-2 py-1 h-8 text-xs font-medium"
            >
                🇻🇳 VN
            </Button>
            <Button
                variant={locale === 'en' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLocale('en')}
                className="px-2 py-1 h-8 text-xs font-medium"
            >
                🇬🇧 EN
            </Button>
        </div>
    )
}
