import { useLayoutEffect, useRef } from 'react';
import DotEnd from './DotEnd';

// The Standout typographic step: line two starts where line one ends,
// as far as the measure allows (minus `trail`, room kept for what follows).
export function useStep(ref, deps = []) {
  useLayoutEffect(() => {
    const title = ref.current;
    if (!title) return undefined;
    const measure = () => {
      const a = title.querySelector('.step-a');
      const b = title.querySelector('.step-b');
      if (!a || !b) return;
      const trail = Number(title.dataset.trail || 0);
      const room = title.clientWidth - b.offsetWidth - trail;
      title.style.setProperty('--step', `${Math.max(0, Math.min(a.offsetWidth, room))}px`);
    };
    measure();
    document.fonts?.ready.then(measure);
    const ro = new ResizeObserver(measure);
    ro.observe(title);
    return () => ro.disconnect();
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
}

// Page titles use the same gesture, ending on the brand dot.
export default function StepTitle({ lines, as: Tag = 'h1', className = '', trail = 40, dot = true }) {
  const ref = useRef(null);
  useStep(ref, [lines[0], lines[1]]);
  return (
    <Tag className={`step-title ${className}`} ref={ref} data-trail={trail} tabIndex={-1}>
      <span className="hl hl-1">
        <span className="step-a">{lines[0]}</span>
      </span>{' '}
      <span className="hl hl-2">
        <span className="step-b">
          {dot ? <DotEnd text={lines[1]} className="brand-dot page-dot" /> : lines[1]}
        </span>
      </span>
    </Tag>
  );
}
