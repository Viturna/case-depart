import React from 'react';
import styles from './Badge.module.css';

interface BadgeProps {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  rotation?: number; // In degrees, e.g. -5 to +8
  className?: string;
  style?: React.CSSProperties;
}

export default function Badge({
  children,
  size = 'md',
  rotation = -4,
  className = '',
  style,
}: BadgeProps) {
  const sizeClass = size === 'sm' ? styles.sizeSm : size === 'lg' ? styles.sizeLg : styles.sizeMd;

  return (
    <div
      className={`${styles.badge} ${sizeClass} ${className}`}
      style={{
        ...style,
        ['--rotation' as string]: `${rotation}deg`,
      }}
    >
      <span>{children}</span>
    </div>
  );
}

