import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "404 — Page not found",
  description: "The page you requested does not exist on COINX.",
}

export default function NotFound() {
  return (
    <main className="bg-grid flex min-h-screen items-center justify-center bg-bg-base px-4">
      <div className="text-center">
        <span className="font-mono gradient-text text-7xl font-bold">404</span>
        <h1 className="mt-4 text-2xl font-bold">Page not found</h1>
        <p className="text-text-muted mt-2">
          The page you are looking for does not exist.
        </p>
      </div>
    </main>
  )
}
