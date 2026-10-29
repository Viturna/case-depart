import React from 'react';

// Grille de sudoku 9×9 : filets 1px, repère 3×3 en 2px. Décorative.
export default function GridPattern({ className = '' }: { className?: string }) {
  const lines = [1, 2, 3, 4, 5, 6, 7, 8];
  return (
    <svg className={className} viewBox="0 0 90 90" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      {lines.map((i) => {
        const w = i % 3 === 0 ? 2 : 1;
        return (
          <g key={i} stroke="currentColor" strokeWidth={w} vectorEffect="non-scaling-stroke">
            <line x1={i * 10} y1="0" x2={i * 10} y2="90" vectorEffect="non-scaling-stroke" />
            <line x1="0" y1={i * 10} x2="90" y2={i * 10} vectorEffect="non-scaling-stroke" />
          </g>
        );
      })}
      <rect x="0" y="0" width="90" height="90" fill="none" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
