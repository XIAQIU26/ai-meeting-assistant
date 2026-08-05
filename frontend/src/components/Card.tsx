import type { ReactNode } from 'react';

interface CardProps {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}

export function Card({ title, children, action }: CardProps) {
  return (
    <section className="notion-card p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
