import type { CSSProperties, ReactNode } from 'react';

/** Frosted-glass panel (§4.1 .glass). */
export default function Glass({
  children,
  className = '',
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div className={`glass ${className}`.trim()} style={style}>
      {children}
    </div>
  );
}
