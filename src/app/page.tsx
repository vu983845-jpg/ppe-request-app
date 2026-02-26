import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Manufacturing PPE Management
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          Request Personal Protective Equipment quickly, or log in to manage approvals and inventory.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/request">
            <Button size="lg" className="w-full sm:w-auto">
              Request PPE
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Staff Login
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
