import React from 'react';

interface SudokuMotifProps {
  size?: number | string;
  variant?: 'logo' | 'cover' | 'background' | 'icon';
  themeColor?: 'sapin' | 'sable' | 'rose' | 'brique';
  fillTopLeft?: boolean;
  fillCenter?: boolean;
  className?: string;
  numbers?: (number | string | null)[]; // 9 cells
}

export default function SudokuMotif({
  size = 34,
  variant = 'logo',
  themeColor = 'sapin',
  fillTopLeft = true,
  fillCenter = false,
  className = '',
  numbers,
}: SudokuMotifProps) {
  const strokeColor = themeColor === 'sable' ? 'var(--sable)' : 'var(--sapin)';
  const fillColor = themeColor === 'sable' ? 'var(--sable)' : 'var(--sapin)';

  // Cells index 0 to 8:
  // 0 1 2
  // 3 4 5
  // 6 7 8
  const defaultNumbers = numbers || (variant === 'cover' ? [3, '', 7, '', 5, '', 9, '', 2] : []);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
      {/* Outer border 2px or 1px */}
      <rect
        x="0.5"
        y="0.5"
        width="35"
        height="35"
        stroke={strokeColor}
        strokeWidth={variant === 'logo' || variant === 'icon' ? '2' : '1'}
      />

      {/* Vertical inner lines */}
      <line x1="12" y1="0" x2="12" y2="36" stroke={strokeColor} strokeWidth="1" />
      <line x1="24" y1="0" x2="24" y2="36" stroke={strokeColor} strokeWidth="1" />

      {/* Horizontal inner lines */}
      <line x1="0" y1="12" x2="36" y2="12" stroke={strokeColor} strokeWidth="1" />
      <line x1="0" y1="24" x2="36" y2="24" stroke={strokeColor} strokeWidth="1" />

      {/* Case départ: Top-left cell filled (0,0 to 12,12) */}
      {(fillTopLeft || variant === 'logo') && (
        <rect x="0" y="0" width="12" height="12" fill={fillColor} />
      )}

      {/* Center cell filled (12,12 to 24,24) */}
      {fillCenter && (
        <rect x="12" y="12" width="12" height="24" fill={fillColor} />
      )}

      {/* Optional numbers in cells */}
      {defaultNumbers.length > 0 &&
        defaultNumbers.map((num, idx) => {
          if (!num) return null;
          // Row and Col
          const col = idx % 3;
          const row = Math.floor(idx / 3);
          const x = col * 12 + 6;
          const y = row * 12 + 8.5;
          const isTopLeft = col === 0 && row === 0 && (fillTopLeft || variant === 'logo');
          return (
            <text
              key={idx}
              x={x}
              y={y}
              textAnchor="middle"
              fill={isTopLeft ? (themeColor === 'sable' ? 'var(--sapin)' : 'var(--sable)') : strokeColor}
              fontFamily="var(--font-mono)"
              fontSize="7"
              fontWeight="600"
            >
              {num}
            </text>
          );
        })}
    </svg>
  );
}

