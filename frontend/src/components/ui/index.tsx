import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { X } from 'lucide-react';

export const cn = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(' ');

const buttonVariants = {
  primary: 'bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-slate-200',
  secondary: 'bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 dark:bg-neutral-900 dark:text-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800',
  ghost: 'text-slate-700 hover:bg-slate-100 dark:text-neutral-200 dark:hover:bg-neutral-800',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  warning: 'bg-amber-500 text-slate-950 hover:bg-amber-400',
  success: 'bg-emerald-600 text-white hover:bg-emerald-700',
};

const buttonSizes = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-5 text-sm',
  icon: 'h-9 w-9 p-0',
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof buttonVariants;
  size?: keyof typeof buttonSizes;
};

export function Button({ className, variant = 'secondary', size = 'md', ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:focus:ring-offset-neutral-950',
        buttonVariants[variant],
        buttonSizes[size],
        className,
      )}
      {...props}
    />
  );
}

type AnchorButtonProps = HTMLAttributes<HTMLAnchorElement> & {
  href: string;
  target?: string;
  rel?: string;
  variant?: keyof typeof buttonVariants;
  size?: keyof typeof buttonSizes;
};

export function AnchorButton({ className, variant = 'secondary', size = 'md', ...props }: AnchorButtonProps) {
  return (
    <a
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-950',
        buttonVariants[variant],
        buttonSizes[size],
        className,
      )}
      {...props}
    />
  );
}

const badgeVariants = {
  neutral: 'bg-slate-100 text-slate-700 ring-slate-200 dark:bg-neutral-800 dark:text-neutral-200 dark:ring-slate-700',
  primary: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950 dark:text-amber-200 dark:ring-amber-800',
  danger: 'bg-red-50 text-red-700 ring-red-200 dark:bg-red-950 dark:text-red-200 dark:ring-red-800',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950 dark:text-emerald-200 dark:ring-emerald-800',
  warning: 'bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-950 dark:text-amber-200 dark:ring-amber-800',
};

export function Badge({ className, variant = 'neutral', children }: HTMLAttributes<HTMLSpanElement> & { variant?: keyof typeof badgeVariants }) {
  return <span className={cn('inline-flex h-6 items-center rounded-full px-2.5 text-xs font-medium ring-1 ring-inset', badgeVariants[variant], className)}>{children}</span>;
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input({ className, ...props }, ref) {
  return <input ref={ref} className={cn('h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 shadow-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:disabled:bg-neutral-900', className)} {...props} />;
});

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn('h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 shadow-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100', className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn('min-h-24 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100', className)} {...props} />;
}

export function Checkbox({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input type="checkbox" className={cn('h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500 dark:border-neutral-600 dark:bg-neutral-950', className)} {...props} />;
}

export function Spinner({ label = 'Loading' }: { label?: string }) {
  return <div className="flex min-h-[40vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-amber-500" /><span className="sr-only">{label}</span></div>;
}

export function ErrorBanner({ message, action }: { message: string; action?: ReactNode }) {
  return <div className="mb-6 flex flex-col gap-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800 sm:flex-row sm:items-center sm:justify-between dark:border-red-900 dark:bg-red-950 dark:text-red-100"><span>{message}</span>{action}</div>;
}

export function EmptyState({ title, description, icon }: { title: string; description: string; icon?: ReactNode }) {
  return <div className="flex flex-col items-center justify-center py-16 text-center"><div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-neutral-800 dark:text-neutral-300">{icon}</div><h3 className="text-lg font-semibold text-slate-950 dark:text-neutral-50">{title}</h3><p className="mt-1 max-w-md text-sm text-slate-500 dark:text-neutral-400">{description}</p></div>;
}

export function StatTile({ label, value, tone = 'neutral' }: { label: string; value: string | number; tone?: 'neutral' | 'primary' | 'danger' | 'success' }) {
  const tones = {
    neutral: 'text-slate-950 dark:text-neutral-50',
    primary: 'text-amber-700 dark:text-amber-300',
    danger: 'text-red-700 dark:text-red-300',
    success: 'text-emerald-700 dark:text-emerald-300',
  };
  return <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"><div className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-neutral-400">{label}</div><div className={cn('mt-1 text-2xl font-semibold', tones[tone])}>{value}</div></div>;
}

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><h1 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-neutral-50 sm:text-3xl">{title}</h1>{description && <p className="mt-1 text-sm text-slate-500 dark:text-neutral-400">{description}</p>}</div>{actions && <div className="flex flex-wrap gap-2">{actions}</div>}</div>;
}

export function Modal({ title, children, footer, onClose }: { title: string; children: ReactNode; footer: ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white shadow-xl dark:border-neutral-800 dark:bg-neutral-950">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-neutral-800">
          <h2 className="text-lg font-semibold text-slate-950 dark:text-neutral-50">{title}</h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close modal"><X className="h-4 w-4" /></Button>
        </div>
        <div className="px-5 py-4">{children}</div>
        <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4 dark:border-neutral-800">{footer}</div>
      </div>
    </div>
  );
}

export function TableShell({ children }: { children: ReactNode }) {
  return <div className="relative overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900"><table className="w-full min-w-[760px] divide-y divide-slate-200 text-sm dark:divide-neutral-800">{children}</table></div>;
}

export const tableHeaderClass = 'bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:bg-neutral-900 dark:text-neutral-400';
export const tableCellClass = 'px-3 py-3 align-middle';
export const tableRowClass = 'border-t border-slate-100 transition-colors hover:bg-slate-50 dark:border-neutral-800 dark:hover:bg-neutral-800/60';
export const tableActionHeaderClass = 'sticky right-0 z-10 bg-slate-50 px-3 py-3 text-right shadow-[-8px_0_12px_-12px_rgba(15,23,42,0.45)] dark:bg-neutral-900';
export const tableActionCellClass = 'sticky right-0 z-10 bg-white px-3 py-3 text-right shadow-[-8px_0_12px_-12px_rgba(15,23,42,0.45)] dark:bg-neutral-900';
