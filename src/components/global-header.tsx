"use client"

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

export function GlobalHeader() {
    const pathname = usePathname()
    const isHomePage = pathname === '/'

    return (
        <header className="border-b bg-white dark:bg-zinc-950/50 sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center">
                {!isHomePage && (
                    <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <div className="bg-white rounded-md px-2 py-1 shadow-sm">
                            <div className="relative w-28 h-8">
                                <Image
                                    src="/intersnack-logo.jpg"
                                    alt="Intersnack Logo"
                                    fill
                                    className="object-contain object-center"
                                    priority
                                />
                            </div>
                        </div>
                    </Link>
                )}
            </div>
        </header>
    )
}
