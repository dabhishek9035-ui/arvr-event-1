'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { MouseEventHandler, ReactNode } from 'react';

interface ButtonProps {
  href?: string;
  onClick?: MouseEventHandler;
  variant?: 'primary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  arrow?: boolean;
  children: ReactNode;
  type?: 'button' | 'submit';
  disabled?: boolean;
  ariaDisabled?: boolean;
  className?: string;
  full?: boolean;
}

export default function Button({
  href,
  onClick,
  variant = 'primary',
  size = 'md',
  arrow,
  children,
  type = 'button',
  disabled,
  ariaDisabled,
  className = '',
  full,
}: ButtonProps) {
  const cls = [
    'btn',
    variant === 'ghost' ? 'btn-ghost' : 'btn-primary',
    `btn-${size}`,
    full ? 'btn-full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  const showArrow = arrow ?? variant === 'primary';
  const inner = (
    <>
      <span className="btn-label">{children}</span>
      {showArrow ? <ArrowRight className="btn-arrow" size={18} strokeWidth={1.5} aria-hidden="true" /> : null}
    </>
  );
  if (href) {
    return (
      <Link href={href} className={cls} onClick={onClick} aria-disabled={ariaDisabled || undefined}>
        {inner}
      </Link>
    );
  }
  return (
    <button
      type={type}
      className={cls}
      onClick={onClick}
      disabled={disabled}
      aria-disabled={ariaDisabled || disabled || undefined}
    >
      {inner}
    </button>
  );
}
