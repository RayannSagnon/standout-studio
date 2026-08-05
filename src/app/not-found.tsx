import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-5 py-16 text-center">
      <p className="text-xs font-semibold tracking-[0.12em] text-teal">404</p>
      <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink">
        Page not found
      </h1>
      <p className="mt-3 text-sm text-muted">
        That page does not exist. Head back to Standout Studio.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-teal px-5 text-sm font-semibold text-inverse"
      >
        Back home
      </Link>
    </div>
  );
}
