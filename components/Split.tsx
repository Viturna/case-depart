import React from 'react';

// Découpe un titre en mots puis en lettres pour l'animation de montée.
// trigger "load" : révélé par le Preloader ; "view" : révélé par Reveal au scroll.
export default function Split({
  lines,
  highlight,
  trigger = 'view',
  as: As = 'p',
  className = '',
  id,
}: {
  lines: string[];
  highlight?: string;
  trigger?: 'load' | 'view';
  as?: 'h1' | 'h2' | 'p';
  className?: string;
  id?: string;
}) {
  let i = 0;
  return (
    <As id={id} className={className} data-split={trigger} aria-label={lines.join(' ')}>
      {lines.map((line, l) => (
        <span key={l} className="split-line" aria-hidden="true">
          {line.split(' ').map((word, w) => (
            <React.Fragment key={w}>
              {w > 0 && ' '}
              <span className={`split-word${word === highlight ? ' split-mark' : ''}`}>
                {Array.from(word).map((c, k) => (
                  <span key={k} className="split-char" style={{ '--i': i++ } as React.CSSProperties}>{c}</span>
                ))}
              </span>
            </React.Fragment>
          ))}
        </span>
      ))}
    </As>
  );
}
