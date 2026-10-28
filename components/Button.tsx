import React from 'react';
import Link from 'next/link';
import styles from './Button.module.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  href,
  fullWidth = false,
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  const sizeClass = size === 'sm' ? styles.sizeSm : size === 'lg' ? styles.sizeLg : styles.sizeMd;
  const variantClass = styles[variant];
  const combinedClasses = `${styles.button} ${sizeClass} ${variantClass} ${fullWidth ? styles.fullWidth : ''} ${disabled ? styles.disabled : ''} ${className}`;

  if (href) {
    return (
      <Link href={href} className={combinedClasses} aria-disabled={disabled}>
        {children}
      </Link>
    );
  }

  return (
    <button className={combinedClasses} disabled={disabled} {...props}>
      {children}
    </button>
  );
}

