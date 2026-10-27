'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type Line = { text: string; emphasis?: boolean };
type Props = { lines: Line[]; as?: 'h2' | 'blockquote'; mode?: 'smooth' | 'human'; className?: string };

export default function TypeboardTitle({ lines, as = 'h2', mode = 'human', className = '' }: Props) {
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
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
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
    if (!root.current || started || reduced) return;
    const observer = new IntersectionObserver(entries => {
      if (entries[0]?.isIntersecting) {
        setStarted(true);
        observer.disconnect();
      }
    }, { threshold: 0.28 });
    observer.observe(root.current);
    return () => observer.disconnect();
  }, [started, reduced]);

  useEffect(() => {
    if (!started || reduced || count >= total) return;
    const previous = glyphs.current[count - 1]?.textContent || '';
    const rhythm = mode === 'smooth' ? 72 : 64 + ((count * 17) % 37) - 18;
    const pause = /[,;:]/.test(previous) ? 170 : /[.!?]/.test(previous) ? 280 : 0;
    const timer = window.setTimeout(() => setCount(value => value + 1), count === 0 ? 150 : rhythm + pause);
    return () => window.clearTimeout(timer);
  }, [count, mode, reduced, started, total]);

  useEffect(() => {
    if (reduced || !started || count < total) return;
    const timer = window.setTimeout(() => setFinished(true), 270);
    return () => window.clearTimeout(timer);
  }, [count, reduced, started, total]);

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
    {!reduced && started && <span aria-hidden="true" className={`typeboard-cursor ${finished ? 'is-period' : ''}`} style={{ '--cursor-x': `${cursor.x}px`, '--cursor-y': `${cursor.y}px`, '--cursor-height': `${cursor.height}px` } as React.CSSProperties} />}
  </Tag>;
}
