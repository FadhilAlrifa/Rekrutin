import { Fragment } from 'react';

export default function MaskedWords({ segments = [], wordClass = 'section-heading-word' }) {
  const words = [];

  segments.forEach((seg) => {
    const normalized = typeof seg === 'string' ? { text: seg } : seg;
    const parts = (normalized.text || '').trim().split(/\s+/).filter(Boolean);
    parts.forEach((word) => {
      words.push({
        word,
        className: normalized.className || ''
      });
    });
  });

  return (
    <>
      {words.map((item, idx) => (
        <Fragment key={`${item.word}-${idx}`}>
          <span className="inline-block overflow-hidden align-bottom pb-[0.16em] -mb-[0.16em] pr-[0.08em] -mr-[0.08em]">
            <span
              className={`${wordClass} inline-block origin-bottom-left gpu-accelerated ${item.className}`}
            >
              {item.word}
            </span>
          </span>
          {idx < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </>
  );
}
