import Link from 'next/link'
import { ArrowLeft, Compass } from 'lucide-react'

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-16 text-foreground">
      <section className="flex w-full max-w-xl flex-col items-center text-center">
        <div className="mb-8 flex size-16 items-center justify-center rounded-2xl border border-border bg-muted text-primary">
          <Compass aria-hidden="true" className="size-8" strokeWidth={1.5} />
        </div>

        <p className="font-mono text-sm font-medium uppercase tracking-[0.22em] text-muted-foreground">
          Error 404
        </p>
        <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          This page could not be found.
        </h1>
        <p className="mt-5 max-w-md text-pretty leading-7 text-muted-foreground">
          The address may be incorrect, or the page may have moved or been removed.
          Check the URL and try again.
        </p>

        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Return home
        </Link>
      </section>
    </main>
  )
}
