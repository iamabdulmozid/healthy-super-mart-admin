import type { ReactNode, HTMLAttributes } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  children: ReactNode;
}

export function Card({
  variant = 'default',
  padding = 'md',
  hover = false,
  children,
  className = '',
  ...props
}: CardProps) {
  const baseStyles = 'bg-white rounded-lg';

  const variantStyles = {
    default: 'border border-(--color-border) shadow-xs',
    bordered: 'border-2 border-(--color-border)',
    elevated: 'shadow-md',
  };

  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const hoverStyles = hover
    ? 'transition-all duration-200 hover:shadow-sm hover:border-(--color-border-dark) cursor-pointer'
    : '';

  const classes = `${baseStyles} ${variantStyles[variant]} ${paddingStyles[padding]} ${hoverStyles} ${className}`;

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`mb-4 ${className}`}>{children}</div>;
}

export function CardTitle({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <h3 className={`text-lg font-semibold text-neutral-900 ${className}`}>{children}</h3>;
}

export function CardDescription({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <p className={`text-sm text-neutral-600 mt-1 ${className}`}>{children}</p>;
}

export function CardContent({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

export function CardFooter({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`mt-4 pt-4 border-t border-(--color-border-light) ${className}`}>{children}</div>;
}

export default Card;
