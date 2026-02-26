'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { dictionaries, Locale, TranslationDict } from './dictionaries'

type LanguageContextType = {
    locale: Locale
    t: TranslationDict
    setLocale: (loc: Locale) => void
}

const defaultContext: LanguageContextType = {
    locale: 'vi',
    t: dictionaries.vi,
    setLocale: () => { }
}

const LanguageContext = createContext<LanguageContextType>(defaultContext)

export const LanguageProvider = ({
    children,
    initialLocale
}: {
    children: React.ReactNode
    initialLocale: Locale
}) => {
    const [locale, setLocaleState] = useState<Locale>(initialLocale)

    // Sync client state if server prop changes somehow
    useEffect(() => {
        setLocaleState(initialLocale)
    }, [initialLocale])

    const setLocale = (newLocale: Locale) => {
        setLocaleState(newLocale)
        // Set the cookie so server knows on next load
        document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`
        // Force a router refresh to re-fetch server components
        window.location.reload()
    }

    const t = dictionaries[locale] || dictionaries.vi

    return (
        <LanguageContext.Provider value={{ locale, t, setLocale }}>
            {children}
        </LanguageContext.Provider>
    )
}

export const useLanguage = () => useContext(LanguageContext)
