'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type Line = { text: string; emphasis?: boolean };
type Props = { lines: Line[]; as?: 'h2' | 'blockquote'; className?: string };

export default function TypeboardTitle({ lines, as = 'h2', className = '' }: Props) {
  const segments = useMemo(() => lines.map(({ text }, lineIndex) => {
    const withoutPeriod = lineIndex === lines.length - 1 ? text.replace(/\.$/, '') : text;
    return typeof Intl.Segmenter === 'function'
      ? Array.from(new Intl.Segmenter('es', { granularity: 'grapheme' }).segment(withoutPeriod), part => part.segment)
      : Array.from(withoutPeriod);
  }), [lines]);
  const total = segments.reduce((sum, line) => sum + line.length, 0);
  const label = lines.map(line => line.text).join(' ');
  const root = useRef<HTMLElement>(null);
  const glyphs = useRef<(HTMLSpanElement | null)[]>([]);
  const [count, setCount] = useState(0);
  const [active, setActive] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [cursor, setCursor] = useState({ x: 0, y: 0, height: 0 });

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(preference.matches);
    update();
    preference.addEventListener('change', update);
    return () => preference.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const element = root.current;
    if (!element || reduced) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = element.getBoundingClientRect();
      const viewport = window.innerHeight;
      // Scrub the complete phrase while its heading travels through the viewport.
      const progress = Math.max(0, Math.min(1, (viewport * .84 - rect.top) / (viewport * .64)));
      setCount(Math.round(progress * total));
      setActive(rect.top < viewport && rect.bottom > 0);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    schedule();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    document.fonts.ready.then(schedule);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [reduced, total]);

  useEffect(() => {
    const element = root.current;
    if (!element || reduced) return;
    let frame = 0;
    const measure = () => {
      const parent = element.getBoundingClientRect();
      const target = glyphs.current[Math.max(0, Math.min(count, total - 1))];
      if (!target) return;
      const rect = target.getBoundingClientRect();
      const start = count < total;
      setCursor({ x: (start ? rect.left : rect.right) - parent.left, y: rect.top - parent.top, height: rect.height });
    };
    const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(measure); };
    schedule();
    document.fonts.ready.then(schedule);
    const resize = new ResizeObserver(schedule);
    resize.observe(element);
    window.addEventListener('resize', schedule);
    return () => { cancelAnimationFrame(frame); resize.disconnect(); window.removeEventListener('resize', schedule); };
  }, [count, reduced, total]);

  const Tag = as;
  let index = 0;
  return <Tag ref={root as never} className={`typeboard-title ${className}`} aria-label={label}>
    {segments.map((line, lineIndex) => {
      const content = line.map((glyph, glyphIndex) => {
        const current = index++;
        return <span key={`${lineIndex}-${glyphIndex}`} ref={node => { glyphs.current[current] = node; }} className="typeboard-glyph" style={{ visibility: reduced || current < count ? 'visible' : 'hidden' }}>{glyph === ' ' ? '\u00a0' : glyph}</span>;
      });
      const period = reduced && lineIndex === segments.length - 1 ? '.' : null;
      return <span key={lineIndex} className="typeboard-line" aria-hidden="true">{lines[lineIndex].emphasis ? <em>{content}{period}</em> : <>{content}{period}</>}</span>;
    })}
    {!reduced && active && <span aria-hidden="true" className={`typeboard-cursor ${count >= total ? 'is-period' : ''}`} style={{ '--cursor-x': `${cursor.x}px`, '--cursor-y': `${cursor.y}px`, '--cursor-height': `${cursor.height}px` } as React.CSSProperties} />}
  </Tag>;
}
