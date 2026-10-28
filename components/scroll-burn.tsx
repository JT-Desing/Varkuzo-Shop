'use client';

import { useEffect, useRef } from 'react';

type ScrollBurnProps = {
  color?: string;
  start?: number;
  end?: number;
  blobSize?: number;
  noise?: number;
  detail?: number;
  seed?: number;
};

const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value));

function hash(x: number, y: number, seed: number) {
  let value = Math.imul(x + seed * 101, 374761393) + Math.imul(y - seed * 17, 668265263);
  value = Math.imul(value ^ (value >>> 13), 1274126177);
  return ((value ^ (value >>> 16)) >>> 0) / 4294967295;
}

function valueNoise(x: number, y: number, seed: number) {
  const ix = Math.floor(x), iy = Math.floor(y);
  const fx = x - ix, fy = y - iy;
  const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
  const a = hash(ix, iy, seed) * (1 - sx) + hash(ix + 1, iy, seed) * sx;
  const b = hash(ix, iy + 1, seed) * (1 - sx) + hash(ix + 1, iy + 1, seed) * sx;
  return (a * (1 - sy) + b * sy) * 2 - 1;
}

export function ScrollBurn({ color = '#f1eee8', start = .02, end = .34, blobSize = 72, noise = 1, detail = .55, seed = 47 }: ScrollBurnProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const hero = canvas?.parentElement;
    const context = canvas?.getContext('2d', { alpha: true });
    if (!canvas || !hero || !context) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let width = 0, height = 0, logicalHeight = 0, scale = 1;
    let field = new Float32Array(0);
    let texturePixels: Uint8ClampedArray | null = null;
    let frame = 0;
    let lastProgress = -1;
    const rgb = /^#([0-9a-f]{6})$/i.exec(color)?.[1] || 'f1eee8';
    const red = parseInt(rgb.slice(0, 2), 16), green = parseInt(rgb.slice(2, 4), 16), blue = parseInt(rgb.slice(4, 6), 16);
    const texture = new Image();
    texture.src = '/images/collection-paper.png';
    texture.onload = () => measure();

    const measure = () => {
      const rect = hero.getBoundingClientRect();
      logicalHeight = rect.height;
      scale = Math.min(1, 760 / Math.max(1, rect.width));
      width = Math.max(1, Math.round(rect.width * scale));
      height = Math.max(1, Math.round(rect.height * scale));
      canvas.width = width;
      canvas.height = height;
      texturePixels = null;
      if (texture.complete && texture.naturalWidth) {
        const textureCanvas = document.createElement('canvas');
        textureCanvas.width = width;
        textureCanvas.height = height;
        const textureContext = textureCanvas.getContext('2d');
        if (textureContext) {
          // The lower edge matches the top of the paper background below the hero.
          textureContext.translate(0, height);
          textureContext.scale(1, -1);
          textureContext.drawImage(texture, 0, 0, width, height);
          texturePixels = textureContext.getImageData(0, 0, width, height).data;
        }
      }
      field = new Float32Array(width * height);
      const scaledBlob = Math.max(14, blobSize * scale);
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const large = valueNoise(x / scaledBlob, y / scaledBlob, seed);
          const medium = valueNoise(x / (scaledBlob * .37), y / (scaledBlob * .37), seed + 11);
          const fine = valueNoise(x / (scaledBlob * .12), y / (scaledBlob * .12), seed + 29);
          field[y * width + x] = (large * .58 + medium * .31 + fine * .11 * detail) * noise;
        }
      }
      lastProgress = -1;
      schedule();
    };

    const draw = () => {
      frame = 0;
      if (motion.matches) { context.clearRect(0, 0, width, height); return; }
      const rect = hero.getBoundingClientRect();
      if (rect.bottom <= 0 || rect.top >= window.innerHeight) return;
      const progress = clamp((-rect.top / logicalHeight - start) / (end - start), 0, 1);
      if (Math.abs(progress - lastProgress) < .001) return;
      lastProgress = progress;
      if (progress <= 0) { context.clearRect(0, 0, width, height); return; }
      const pixels = context.createImageData(width, height);
      const data = pixels.data;
      // Reveal the paper along the section seam as soon as scrolling begins.
      // Finish early enough to be noticeable, while keeping the collection near the banner.
      const easedProgress = progress * progress * (3 - 2 * progress);
      const edge = height - Math.min(height * .21, 140 * scale) * easedProgress;
      const amplitude = Math.max(18, Math.min(58, height * .075));
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const offset = y * width + x;
          const distance = y - edge + field[offset] * amplitude;
          const alpha = clamp((distance + 1.5) / 3, 0, 1);
          const pixel = offset * 4;
          data[pixel] = texturePixels?.[pixel] ?? red;
          data[pixel + 1] = texturePixels?.[pixel + 1] ?? green;
          data[pixel + 2] = texturePixels?.[pixel + 2] ?? blue;
          data[pixel + 3] = Math.round(alpha * 255);
        }
      }
      context.putImageData(pixels, 0, 0);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(draw); };
    const resize = new ResizeObserver(measure);
    resize.observe(hero);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    motion.addEventListener('change', schedule);
    measure();
    return () => {
      resize.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      motion.removeEventListener('change', schedule);
      texture.onload = null;
      if (frame) cancelAnimationFrame(frame);
    };
  }, [color, start, end, blobSize, noise, detail, seed]);

  return <canvas ref={canvasRef} className="scroll-burn" aria-hidden="true" />;
}
