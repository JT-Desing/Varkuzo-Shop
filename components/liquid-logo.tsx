'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';

const vertexSource = `
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = (a_position + 1.0) * 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

const fragmentSource = `
precision mediump float;
varying vec2 v_uv;
uniform sampler2D u_logo;
uniform vec2 u_pointer;
uniform float u_aspect;
uniform float u_time;
uniform float u_strength;
void main() {
  vec2 delta = vec2((v_uv.x - u_pointer.x) * u_aspect, v_uv.y - u_pointer.y);
  float distanceToPointer = length(delta);
  float envelope = exp(-distanceToPointer * distanceToPointer * 27.0);
  float wave = sin(distanceToPointer * 38.0 - u_time * 10.0) * envelope * u_strength;
  vec2 direction = delta / max(distanceToPointer, 0.0001);
  vec2 offset = vec2(direction.x / u_aspect, direction.y) * wave * 0.025;
  vec4 center = texture2D(u_logo, v_uv + offset);
  float fringe = wave * 0.003;
  float redAlpha = texture2D(u_logo, v_uv + offset + vec2(fringe, 0.0)).a;
  float blueAlpha = texture2D(u_logo, v_uv + offset - vec2(fringe, 0.0)).a;
  vec3 ink = vec3(0.96 + (redAlpha - center.a) * 0.13, 0.94, 0.90 + (blueAlpha - center.a) * 0.18);
  gl_FragColor = vec4(ink, center.a);
}`;

function compileShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export function LiquidLogo({ onClick, href = '/', className = '', label = 'Varkuzo, inicio' }: { onClick?: () => void; href?: string; className?: string; label?: string }) {
  const anchorRef = useRef<HTMLAnchorElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const anchor = anchorRef.current;
    const canvas = canvasRef.current;
    if (!anchor || !canvas || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const gl = canvas.getContext('webgl', { alpha: true, antialias: true, premultipliedAlpha: false });
    if (!gl) return;

    const vertex = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
    const fragment = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
    if (!vertex || !fragment) return;
    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    gl.useProgram(program);
    const position = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    const pointerUniform = gl.getUniformLocation(program, 'u_pointer');
    const aspectUniform = gl.getUniformLocation(program, 'u_aspect');
    const timeUniform = gl.getUniformLocation(program, 'u_time');
    const strengthUniform = gl.getUniformLocation(program, 'u_strength');
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    let frame = 0;
    let hovering = false;
    let strength = 0;
    let pointerX = 0.5;
    let pointerY = 0.5;
    const started = performance.now();
    const source = new Image();

    const draw = () => {
      if (!source.complete || !source.naturalWidth) return;
      const width = anchor.clientWidth;
      const height = anchor.clientHeight;
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.round(width * pixelRatio));
      const h = Math.max(1, Math.round(height * pixelRatio));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
      strength += ((hovering ? 1 : 0) - strength) * 0.12;
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(pointerUniform, pointerX, pointerY);
      gl.uniform1f(aspectUniform, width / height);
      gl.uniform1f(timeUniform, (performance.now() - started) / 1000);
      gl.uniform1f(strengthUniform, strength);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      if (hovering || strength > 0.005) frame = requestAnimationFrame(draw);
    };

    source.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
      draw();
      anchor.classList.add('brand-logo--liquid-ready');
    };
    source.src = '/images/varkuzo-wordmark.svg';
    const move = (event: PointerEvent) => {
      const rect = anchor.getBoundingClientRect();
      pointerX = (event.clientX - rect.left) / rect.width;
      pointerY = 1 - (event.clientY - rect.top) / rect.height;
      if (!hovering) {
        hovering = true;
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(draw);
      }
    };
    const leave = () => { hovering = false; };
    anchor.addEventListener('pointerenter', move);
    anchor.addEventListener('pointermove', move);
    anchor.addEventListener('pointerleave', leave);
    return () => {
      cancelAnimationFrame(frame);
      anchor.removeEventListener('pointerenter', move);
      anchor.removeEventListener('pointermove', move);
      anchor.removeEventListener('pointerleave', leave);
      anchor.classList.remove('brand-logo--liquid-ready');
      gl.deleteTexture(texture);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
    };
  }, []);

  return <Link ref={anchorRef} href={href} aria-label={label} className={`brand-logo ${className}`.trim()} onClick={onClick}>
    <img src="/images/varkuzo-wordmark.svg" alt="" aria-hidden="true" />
    <canvas ref={canvasRef} className="brand-logo-liquid" aria-hidden="true" />
  </Link>;
}
