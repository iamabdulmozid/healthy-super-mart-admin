import type { ReactNode } from 'react';

export interface BadgeProps {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  size?: 'sm' | 'md';
  children: ReactNode;
  className?: string;
}

export function Badge({ 
  variant = 'neutral', 
  size = 'md', 
  children,
  className = '' 
}: BadgeProps) {
  const baseStyles = 'inline-flex items-center font-medium rounded-full whitespace-nowrap';

  const variantStyles = {
    success: 'bg-secondary-100 text-secondary-800',
    warning: 'bg-accent-100 text-accent-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-primary-100 text-primary-800',
    neutral: 'bg-neutral-100 text-neutral-700',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };

  const classes = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;

  return <span className={classes}>{children}</span>;
}

export default Badge;
