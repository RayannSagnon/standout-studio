// Text that ends on the brand dot. The last word and the dot are kept on the same line,
// so the dot never wraps on its own.
export default function DotEnd({ text, className = 'brand-dot' }) {
  const s = String(text ?? '');
  const i = s.lastIndexOf(' ');
  const head = i >= 0 ? s.slice(0, i + 1) : '';
  const tail = i >= 0 ? s.slice(i + 1) : s;
  return (
    <>
      {head}
      <span className="nowrap">
        {tail}
        <span className={className} aria-hidden="true" />
      </span>
    </>
  );
}
