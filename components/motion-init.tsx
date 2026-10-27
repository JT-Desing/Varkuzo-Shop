'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function MotionInit() {
  const pathname = usePathname();
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      }
    }, { threshold: 0.06, rootMargin: '0px 0px 30px 0px' });
    const observed = new WeakSet<Element>();
    const observe = (root: ParentNode) => {
      if (root instanceof Element && root.matches('.reveal') && !observed.has(root)) {
        observed.add(root);
        observer.observe(root);
      }
      root.querySelectorAll('.reveal').forEach((element) => {
        if (!observed.has(element)) {
          observed.add(element);
          observer.observe(element);
        }
      });
    };
    observe(document);
    // Next may stream sections after this effect runs.
    const mutations = new MutationObserver((records) => {
      for (const record of records) record.addedNodes.forEach((node) => {
        if (node instanceof Element) observe(node);
      });
    });
    mutations.observe(document.body, { childList: true, subtree: true });
    document.documentElement.classList.add('motion-enabled');
    // Some mobile browsers miss intersection callbacks after route changes or
    // while the hero's scroll animation is repainting. Keep the content usable.
    const revealInView = () => {
      document.querySelectorAll<HTMLElement>('.reveal:not(.is-visible)').forEach((element) => {
        const rect = element.getBoundingClientRect();
        if (rect.top < window.innerHeight + 60 && rect.bottom > -60) {
          element.classList.add('is-visible');
          observer.unobserve(element);
        }
      });
    };
    window.addEventListener('scroll', revealInView, { passive: true });
    window.addEventListener('resize', revealInView);
    const firstCheck = window.setTimeout(revealInView, 100);
    const mobileFallback = window.setTimeout(() => {
      if (window.matchMedia('(max-width: 700px)').matches) {
        document.querySelectorAll('.reveal:not(.is-visible)').forEach((element) => element.classList.add('is-visible'));
      }
    }, 3500);
    return () => {
      mutations.disconnect();
      observer.disconnect();
      window.removeEventListener('scroll', revealInView);
      window.removeEventListener('resize', revealInView);
      window.clearTimeout(firstCheck);
      window.clearTimeout(mobileFallback);
      document.documentElement.classList.remove('motion-enabled');
    };
  }, [pathname]);
  return null;
}
