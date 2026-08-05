"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-5 py-16 text-center">
      <h2 className="font-display text-2xl font-bold tracking-tight text-ink">
        Something went wrong
      </h2>
      <p className="mt-3 text-sm text-muted">
        Refresh the page, or try again in a moment.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-teal px-5 text-sm font-semibold text-inverse"
      >
        Try again
      </button>
    </div>
  );
}
