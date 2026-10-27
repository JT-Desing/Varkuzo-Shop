'use client';

import { useEffect, useRef, useState } from 'react';

type Props = {
  words: string[];
  image: string;
  imageAlt: string;
  speedSeconds?: number;
  direction?: 'clockwise' | 'counterclockwise';
  tiltX?: number;
  tiltZ?: number;
};

export function RotatingDiscountRing({ words, image, imageAlt, speedSeconds = 22, direction = 'clockwise', tiltX = 13, tiltZ = -31 }: Props) {
  const visualRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLCanvasElement>(null);
  const frontRef = useRef<HTMLCanvasElement>(null);
  const elapsedRef = useRef(0);
  const [visible, setVisible] = useState(true);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const element = visualRef.current;
    if (!element || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.05 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const element = visualRef.current;
    const backCanvas = backRef.current;
    const frontCanvas = frontRef.current;
    if (!element || !backCanvas || !frontCanvas) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const letters = [...`${words.join(' ')} `.repeat(2)];
    const rotation = tiltZ * Math.PI / 180;
    const flatten = Math.sin(tiltX * Math.PI / 180);
    const ux = Math.cos(rotation);
    const uy = Math.sin(rotation);
    const vx = -uy;
    const vy = ux;
    let frameId = 0;
    let lastPaint = 0;
    let previousTime = 0;

    const draw = (time: number) => {
      if (previousTime && !reducedMotion.matches) elapsedRef.current += Math.min(time - previousTime, 100);
      previousTime = time;
      frameId = requestAnimationFrame(draw);
      if (time - lastPaint < 32) return;
      lastPaint = time;

      const { width, height } = element.getBoundingClientRect();
      if (!width || !height) return;
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      const layers = [backCanvas, frontCanvas];
      for (const canvas of layers) {
        const w = Math.round(width * pixelRatio);
        const h = Math.round(height * pixelRatio);
        if (canvas.width !== w || canvas.height !== h) {
          canvas.width = w;
          canvas.height = h;
        }
      }
      const contexts = layers.map((canvas) => canvas.getContext('2d'));
      contexts.forEach((ctx) => {
        if (!ctx) return;
        ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        ctx.clearRect(0, 0, width, height);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
      });

      const radius = Math.min(330, Math.max(145, width * 0.43));
      const centerX = width * 0.5;
      const centerY = height * 0.28;
      const fontSize = Math.min(39, Math.max(22, width * 0.053));
      const phase = (direction === 'clockwise' ? 1 : -1) * elapsedRef.current / (speedSeconds * 1000) * Math.PI * 2;
      const angleStep = Math.PI * 2 / letters.length;

      letters.forEach((letter, index) => {
        if (letter === ' ') return;
        const angle = phase - index * angleStep;
        const ca = Math.cos(angle);
        const sa = Math.sin(angle);
        const depth = sa * Math.cos(tiltX * Math.PI / 180);
        const front = depth >= 0;
        const ctx = contexts[front ? 1 : 0];
        if (!ctx) return;
        const perspective = 650 / (650 - depth * radius * 0.64);
        const horizontal = radius * ca;
        const vertical = radius * sa * flatten;
        const x = centerX + perspective * (horizontal * ux + vertical * vx);
        const y = centerY + perspective * (horizontal * uy + vertical * vy);
        const dx = radius * (sa * ux - ca * flatten * vx);
        const dy = radius * (sa * uy - ca * flatten * vy);
        let glyphAngle = Math.atan2(dy, dx);
        if (dx < 0) glyphAngle += Math.PI;

        const nextAngle = angle - angleStep;
        const nextDepth = Math.sin(nextAngle) * Math.cos(tiltX * Math.PI / 180);
        const nextPerspective = 650 / (650 - nextDepth * radius * 0.64);
        const nextHorizontal = radius * Math.cos(nextAngle);
        const nextVertical = radius * Math.sin(nextAngle) * flatten;
        const nextX = centerX + nextPerspective * (nextHorizontal * ux + nextVertical * vx);
        const nextY = centerY + nextPerspective * (nextHorizontal * uy + nextVertical * vy);
        const projectedStep = Math.hypot(nextX - x, nextY - y);
        const glyph = front ? letter : letters[letters.length - 1 - index];
        ctx.font = `${front ? 700 : 600} ${fontSize}px Arial, sans-serif`;
        const fitScale = Math.min(1, projectedStep / (ctx.measureText(glyph).width * perspective * 1.06));
        const fitFade = Math.max(0, Math.min(1, (fitScale - 0.16) / 0.36));
        const sideFade = Math.max(0, Math.min(1, (Math.abs(sa) - 0.42) / 0.28));

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(glyphAngle);
        ctx.scale(perspective * fitScale, perspective);
        ctx.globalAlpha = (front ? 1 : 0.36) * fitFade * sideFade;
        ctx.fillStyle = '#741a1e';
        ctx.fillText(glyph, 0, 0);
        ctx.restore();
      });
    };

    const start = () => {
      cancelAnimationFrame(frameId);
      previousTime = 0;
      frameId = requestAnimationFrame(draw);
    };
    const stop = () => {
      cancelAnimationFrame(frameId);
      previousTime = 0;
    };
    const onMotionChange = () => {
      if (reducedMotion.matches) {
        stop();
        draw(0);
        cancelAnimationFrame(frameId);
      } else if (visible && !paused) start();
    };
    const resizeObserver = new ResizeObserver(() => {
      if (reducedMotion.matches || !visible || paused) {
        draw(0);
        cancelAnimationFrame(frameId);
      }
    });
    resizeObserver.observe(element);

    if (reducedMotion.matches || !visible || paused) {
      draw(0);
      cancelAnimationFrame(frameId);
    } else start();
    reducedMotion.addEventListener('change', onMotionChange);
    return () => {
      stop();
      resizeObserver.disconnect();
      reducedMotion.removeEventListener('change', onMotionChange);
    };
  }, [words, visible, paused, speedSeconds, direction, tiltX, tiltZ]);

  return <div className="discount-visual" ref={visualRef} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
    <canvas className="discount-ring-canvas discount-ring-canvas--back" ref={backRef} aria-hidden="true" />
    <img className="discount-model" src={image} alt={imageAlt} />
    <canvas className="discount-ring-canvas discount-ring-canvas--front" ref={frontRef} aria-hidden="true" />
    <span className="discount-visual-caption" aria-hidden="true">VARKUZO / MEDELLÍN</span>
  </div>;
}
