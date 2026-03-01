"use client"

import { useState } from 'react'
import { Mail, MessageCircle, Eye } from 'lucide-react'

interface ContactButtonsProps {
    email: string
    phone: string
    emailLabel: string
    phoneLabel: string
    revealText: string
}

export function ContactButtons({
    email,
    phone,
    emailLabel,
    phoneLabel,
    revealText,
}: ContactButtonsProps) {
    const [showEmail, setShowEmail] = useState(false)
    const [showPhone, setShowPhone] = useState(false)

    // Quick helper to obscure string
    const getObscuredEmail = (emailStr: string) => {
        const parts = emailStr.split('@')
        if (parts.length !== 2) return '***@***.***'
        return `${parts[0].slice(0, 2)}***@${parts[1]}`
    }

    const getObscuredPhone = (phoneStr: string) => {
        return `${phoneStr.slice(0, 4)} *** ***`
    }

    return (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* Email Button */}
            {showEmail ? (
                <a
                    href={`mailto:${email}`}
                    className="flex items-center gap-3 px-6 py-3 rounded-full bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 transition-colors border border-zinc-200 dark:border-zinc-700 w-full sm:w-auto animate-in zoom-in-95 duration-200"
                >
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full">
                        <Mail className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                        <div className="text-xs text-zinc-500 dark:text-zinc-400 leading-tight">{emailLabel}</div>
                        <div className="font-medium text-sm">{email}</div>
                    </div>
                </a>
            ) : (
                <button
                    onClick={() => setShowEmail(true)}
                    className="flex items-center gap-3 px-6 py-3 rounded-full bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 transition-colors border border-zinc-200 dark:border-zinc-700 w-full sm:w-auto cursor-pointer"
                >
                    <div className="p-2 bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400 rounded-full">
                        <Eye className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                        <div className="text-xs text-zinc-500 dark:text-zinc-400 leading-tight">{emailLabel}</div>
                        <div className="font-medium text-sm text-zinc-400 blur-[2px] select-none transition-all hover:blur-0">{getObscuredEmail(email)}</div>
                    </div>
                    <span className="text-xs text-blue-600 dark:text-blue-400 ml-2 font-medium bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-md">{revealText}</span>
                </button>
            )}

            {/* Phone Button */}
            {showPhone ? (
                <a
                    href={`https://zalo.me/${phone.replace(/\s/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-6 py-3 rounded-full bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 transition-colors border border-zinc-200 dark:border-zinc-700 w-full sm:w-auto animate-in zoom-in-95 duration-200"
                >
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full">
                        <MessageCircle className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                        <div className="text-xs text-zinc-500 dark:text-zinc-400 leading-tight">{phoneLabel}</div>
                        <div className="font-medium text-sm">{phone}</div>
                    </div>
                </a>
            ) : (
                <button
                    onClick={() => setShowPhone(true)}
                    className="flex items-center gap-3 px-6 py-3 rounded-full bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 transition-colors border border-zinc-200 dark:border-zinc-700 w-full sm:w-auto cursor-pointer"
                >
                    <div className="p-2 bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400 rounded-full">
                        <Eye className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                        <div className="text-xs text-zinc-500 dark:text-zinc-400 leading-tight">{phoneLabel}</div>
                        <div className="font-medium text-sm text-zinc-400 blur-[2px] select-none transition-all hover:blur-0">{getObscuredPhone(phone)}</div>
                    </div>
                    <span className="text-xs text-blue-600 dark:text-blue-400 ml-2 font-medium bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-md">{revealText}</span>
                </button>
            )}
        </div>
    )
}
