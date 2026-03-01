import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 pt-24">
      <div className="text-center">
        <h1 className="text-8xl font-bold text-primary-600 dark:text-primary-400">404</h1>
        <p className="mt-4 text-xl text-neutral-600 dark:text-neutral-400">
          This page could not be found.
        </p>
        <p className="mt-2 text-neutral-500 dark:text-neutral-500">
          The homepage is at <strong>/</strong> (root). Use the links above or the button below.
        </p>
        <Link
          href="/"
          className="mt-8 inline-block btn-primary"
        >
          Go to Homepage
        </Link>
      </div>
    </div>
  )
}
