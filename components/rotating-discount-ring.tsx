'use client';

import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';

type Props = {
  words: string[];
  image: string;
  imageAlt: string;
  speedSeconds?: number;
  direction?: 'clockwise' | 'counterclockwise';
  radius?: string;
  tiltX?: number;
  tiltY?: number;
  tiltZ?: number;
};

const segmentCount = 16;

export function RotatingDiscountRing({ words, image, imageAlt, speedSeconds = 26, direction = 'clockwise', radius = 'clamp(150px, 20vw, 270px)', tiltX = -15, tiltY = -7, tiltZ = -7 }: Props) {
  const visualRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const element = visualRef.current;
    if (!element || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.05 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const settings = {
    '--ring-radius': radius,
    '--ring-speed': `${speedSeconds}s`,
    '--ring-direction': direction === 'clockwise' ? 'normal' : 'reverse',
    '--ring-tilt-x': `${tiltX}deg`,
    '--ring-tilt-y': `${tiltY}deg`,
    '--ring-tilt-z': `${tiltZ}deg`,
    '--ring-play-state': visible && !paused ? 'running' : 'paused',
  } as CSSProperties;

  const ring = (layer: 'back' | 'front') => <div className={`discount-ring-layer discount-ring-layer--${layer}`} aria-hidden="true">
    <div className="discount-ring-tilt"><div className="discount-ring-orbit">
      {Array.from({ length: segmentCount }, (_, index) => <span className="discount-ring-word" style={{ '--angle': `${index * (360 / segmentCount)}deg` } as CSSProperties} key={index}>{words[index % words.length]}</span>)}
    </div></div>
  </div>;

  return <div className={`discount-visual${words.some((word) => word.length > 12) ? ' discount-visual--long' : ''}`} ref={visualRef} style={settings} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
    <div className="discount-visual-halo" aria-hidden="true" />
    {ring('back')}
    <img className="discount-model" src={image} alt={imageAlt} />
    {ring('front')}
    <span className="discount-visual-caption" aria-hidden="true">VARKUZO / MEDELLÍN</span>
  </div>;
}
