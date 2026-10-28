'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import './newsletter-popup.css';

const subscribedKey = 'varkuzo:newsletter-subscribed';
const dismissedKey = 'varkuzo:newsletter-dismissed-until';
const cartShownKey = 'varkuzo:newsletter-cart-shown';
const snoozeMs = 7 * 24 * 60 * 60 * 1000;

export function NewsletterPopup() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [source, setSource] = useState<'entry' | 'cart'>('entry');
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const subscribed = () => window.localStorage.getItem(subscribedKey) === '1';
    const showCart = () => {
      if (subscribed() || window.sessionStorage.getItem(cartShownKey)) return;
      window.sessionStorage.setItem(cartShownKey, '1');
      setSource('cart');
      setOpen(true);
    };
    window.addEventListener('varkuzo:cart-view', showCart);
    if (pathname === '/carrito' || pathname === '/cart') {
      const timer = window.setTimeout(showCart, 350);
      return () => { window.clearTimeout(timer); window.removeEventListener('varkuzo:cart-view', showCart); };
    }
    const dismissedUntil = Number(window.localStorage.getItem(dismissedKey) || 0);
    const timer = window.setTimeout(() => {
      if (!subscribed() && Date.now() > dismissedUntil && !window.sessionStorage.getItem('varkuzo:newsletter-entry-shown')) {
        window.sessionStorage.setItem('varkuzo:newsletter-entry-shown', '1');
        setSource('entry');
        setOpen(true);
      }
    }, 3000);
    return () => { window.clearTimeout(timer); window.removeEventListener('varkuzo:cart-view', showCart); };
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.style.overflow = 'hidden';
    const focusTimer = window.setTimeout(() => (success ? closeRef.current : emailRef.current)?.focus(), 60);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') dismiss();
      if (event.key !== 'Tab') return;
      const focusables = Array.from(document.querySelectorAll<HTMLElement>('.newsletter-dialog button:not([disabled]), .newsletter-dialog input:not([disabled]), .newsletter-dialog a[href]'));
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => { window.clearTimeout(focusTimer); document.body.style.overflow = previousOverflow; document.removeEventListener('keydown', onKeyDown); previousFocus?.focus(); };
  // The dialog lifecycle alone controls focus and scrolling.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, success]);

  function dismiss() {
    if (!success) window.localStorage.setItem(dismissedKey, String(Date.now() + snoozeMs));
    setOpen(false);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    if (!consent) { setError('Marca la autorización para recibir correos.'); return; }
    setPending(true);
    try {
      const response = await fetch('/api/newsletter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, consent, source }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'No pudimos guardar tu correo.');
      window.localStorage.setItem(subscribedKey, '1');
      window.localStorage.removeItem(dismissedKey);
      setSuccess(true);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'No pudimos guardar tu correo.'); }
    finally { setPending(false); }
  }

  if (!open) return null;
  return <div className="newsletter-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) dismiss(); }}>
    <section className="newsletter-dialog" role="dialog" aria-modal="true" aria-labelledby="newsletter-title" aria-describedby="newsletter-description">
      <div className="newsletter-visual" aria-hidden="true"><img src="/images/shop-buzos-01.webp" alt="" /><span className="newsletter-visual-label">VARKUZO / MEDELLÍN</span><strong>10<span>%</span></strong><span className="newsletter-visual-bottom">LA CALLE TAMBIÉN TIENE PORTE.</span></div>
      <div className="newsletter-panel"><button ref={closeRef} type="button" className="newsletter-close" onClick={dismiss} aria-label="Cerrar suscripción">×</button><img className="newsletter-logo" src="/images/varkuzo-wordmark.svg" alt="Varkuzo" />
        {success ? <div className="newsletter-success" role="status"><span className="newsletter-eyebrow">YA ESTÁS EN LA VUELTA</span><h2 id="newsletter-title">TU 10 %<br />QUEDA GUARDADO.</h2><p id="newsletter-description">Te avisaremos por correo cuando abramos ventas y podamos activar tu beneficio de primera compra.</p><button type="button" className="newsletter-submit" onClick={dismiss}>SEGUIR EXPLORANDO <span>↗</span></button></div> : <><span className="newsletter-eyebrow">UNA INVITACIÓN DESDE EL BARRIO</span><p className="newsletter-quote">“Tiresen muchachos y dejesen llevar por el periodico.”</p><h2 id="newsletter-title">ENTRÁ EN<br /><em>LA VUELTA.</em></h2><p id="newsletter-description">Dejanos tu correo y te reservamos <strong>10 % para tu primera compra</strong>. Te contamos cuando caigan nuevas piezas.</p><form onSubmit={submit}><label htmlFor="newsletter-email">TU CORREO</label><div className="newsletter-email-row"><input ref={emailRef} id="newsletter-email" name="email" type="email" autoComplete="email" placeholder="tu@correo.com" value={email} onChange={(event) => setEmail(event.target.value)} required maxLength={254} /><span aria-hidden="true">↗</span></div><label className="newsletter-consent"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} /><span>Autorizo a Varkuzo a usar mi correo para enviarme novedades y ofertas. Puedo retirar esta autorización. <Link href="/privacidad" onClick={dismiss}>Cómo usamos tus datos</Link>.</span></label>{error && <p className="newsletter-error" role="alert">{error}</p>}<button className="newsletter-submit" type="submit" disabled={pending}>{pending ? 'GUARDANDO...' : 'QUIERO MI 10 %'} <span>↗</span></button></form><small>Beneficio reservado para la primera compra. Se habilitará al abrir ventas; las condiciones se publicarán antes de comprar.</small></>}
      </div>
    </section>
  </div>;
}
