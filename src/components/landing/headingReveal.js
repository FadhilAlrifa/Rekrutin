import gsap from 'gsap';

export function animateMaskedWordsOnScroll(triggerEl, target = '.section-heading-word') {
  if (!triggerEl) return null;

  return gsap.fromTo(
    target,
    {
      yPercent: 110,
      rotate: 2,
      skewY: 2,
      opacity: 0
    },
    {
      yPercent: 0,
      rotate: 0,
      skewY: 0,
      opacity: 1,
      duration: 0.9,
      stagger: 0.065,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: triggerEl,
        start: 'top 85%',
        once: true
      }
    }
  );
}

export function animateSlideUpOnScroll(target, triggerEl, { y = 35, duration = 0.85, stagger = 0.08, delay = 0 } = {}) {
  if (!triggerEl) return null;

  return gsap.fromTo(
    target,
    { y, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      duration,
      stagger,
      delay,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: triggerEl,
        start: 'top 85%',
        once: true
      }
    }
  );
}

export function animateZoomSlideUpOnScroll(target, triggerEl, { y = 30, scale = 0.97, duration = 0.9, stagger = 0.08, delay = 0 } = {}) {
  if (!triggerEl) return null;

  return gsap.fromTo(
    target,
    { y, scale, opacity: 0 },
    {
      y: 0,
      scale: 1,
      opacity: 1,
      duration,
      stagger,
      delay,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: triggerEl,
        start: 'top 85%',
        once: true
      }
    }
  );
}
