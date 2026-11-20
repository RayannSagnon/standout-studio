"use client";

/** Opens the browser's print dialog, where "Save as PDF" is one of the printers. */
export default function PrintButton({ label }: { label: string }) {
  return (
    <button type="button" className="btn btn-primary btn-sm" onClick={() => window.print()}>
      <span>{label}</span>
    </button>
  );
}
