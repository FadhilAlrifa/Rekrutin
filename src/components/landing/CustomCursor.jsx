import { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

export default function CustomCursor() {
  const cursorRef = useRef(null);
  const lastModeRef = useRef('default');
  const lastTextRef = useRef('');
  const [cursorText, setCursorText] = useState('');
  const [cursorMode, setCursorMode] = useState('default'); // 'default' | 'pointer' | 'label'
  const [enabled] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(pointer: fine)').matches : false
  );

  useGSAP(
    () => {
      if (!enabled || !cursorRef.current) return;

      const el = cursorRef.current;
      gsap.set(el, { xPercent: -50, yPercent: -50, opacity: 0 });

      const xTo = gsap.quickTo(el, 'x', { duration: 0.22, ease: 'power3.out' });
      const yTo = gsap.quickTo(el, 'y', { duration: 0.22, ease: 'power3.out' });

      let isVisible = false;

      const updateCursorState = (nextMode, nextText) => {
        if (lastModeRef.current !== nextMode) {
          lastModeRef.current = nextMode;
          setCursorMode(nextMode);
        }
        if (lastTextRef.current !== nextText) {
          lastTextRef.current = nextText;
          setCursorText(nextText);
        }
      };

      const onMouseMove = (e) => {
        if (!isVisible) {
          gsap.to(el, { opacity: 1, duration: 0.25 });
          isVisible = true;
        }
        xTo(e.clientX);
        yTo(e.clientY);

        const target = e.target;
        if (!(target instanceof Element)) return;

        const labelTarget = target.closest('[data-cursor]');
        if (labelTarget) {
          const text = labelTarget.getAttribute('data-cursor') || 'View';
          updateCursorState('label', text);
          return;
        }

        const interactiveTarget = target.closest('button, a, [role="button"]');
        if (interactiveTarget) {
          updateCursorState('pointer', '');
          return;
        }

        updateCursorState('default', '');
      };

      const onMouseLeave = () => {
        gsap.to(el, { opacity: 0, duration: 0.2 });
        isVisible = false;
      };

      window.addEventListener('mousemove', onMouseMove, { passive: true });
      document.addEventListener('mouseleave', onMouseLeave);

      return () => {
        window.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseleave', onMouseLeave);
      };
    },
    { dependencies: [enabled] }
  );

  if (!enabled) return null;

  return (
    <div
      ref={cursorRef}
      aria-hidden="true"
      className="fixed top-0 left-0 z-[9999] pointer-events-none select-none gpu-accelerated hidden md:flex items-center justify-center"
    >
      <div
        className={`flex items-center justify-center rounded-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.36,1)] ${
          cursorMode === 'label'
            ? 'px-4 py-2 bg-[#F59E0B] text-[#141414] border border-[#D97706]/30 shadow-[0_10px_28px_rgba(245,158,11,0.35)] scale-100'
            : cursorMode === 'pointer'
            ? 'w-10 h-10 bg-[#F59E0B]/20 border-2 border-[#F59E0B] scale-100'
            : 'w-3.5 h-3.5 bg-[#141414] border-2 border-white shadow-[0_2px_8px_rgba(0,0,0,0.22)]'
        }`}
      >
        {cursorMode === 'label' && (
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">
            {cursorText}
          </span>
        )}
      </div>
    </div>
  );
}
