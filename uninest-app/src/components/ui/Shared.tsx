import React from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, XCircle } from 'lucide-react';

// Empty State
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4 text-center', className)}>
      {icon && <div className="mb-4 text-text-tertiary">{icon}</div>}
      <h3 className="text-lg font-semibold text-text-primary mb-1">{title}</h3>
      <p className="text-sm text-text-secondary max-w-sm mb-4">{description}</p>
      {action}
    </div>
  );
}

// Skeleton Loader
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton', className)} />;
}

export function SkeletonCard() {
  return (
    <div className="bg-surface rounded-xl border border-border p-5 space-y-3">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
}

// Alert
interface AlertProps {
  type?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Alert({ type = 'info', title, children, className }: AlertProps) {
  const styles = {
    info: { bg: 'bg-blue-50 border-blue-200', icon: <Info className="w-5 h-5 text-blue-600" />, text: 'text-blue-800' },
    success: { bg: 'bg-emerald-50 border-emerald-200', icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />, text: 'text-emerald-800' },
    warning: { bg: 'bg-amber-50 border-amber-200', icon: <AlertTriangle className="w-5 h-5 text-amber-600" />, text: 'text-amber-800' },
    error: { bg: 'bg-red-50 border-red-200', icon: <XCircle className="w-5 h-5 text-red-600" />, text: 'text-red-800' },
  };

  const s = styles[type];

  return (
    <div className={cn('flex gap-3 p-4 rounded-lg border', s.bg, className)}>
      <div className="flex-shrink-0 mt-0.5">{s.icon}</div>
      <div>
        {title && <p className={cn('font-semibold text-sm mb-0.5', s.text)}>{title}</p>}
        <div className={cn('text-sm', s.text)}>{children}</div>
      </div>
    </div>
  );
}

// Progress Bar
export function ProgressBar({
  value,
  max = 100,
  color = 'brand',
  label,
  showPercent = true,
  className,
}: {
  value: number;
  max?: number;
  color?: 'brand' | 'blue' | 'amber' | 'red';
  label?: string;
  showPercent?: boolean;
  className?: string;
}) {
  const pct = Math.round((value / max) * 100);
  const colors = {
    brand: 'bg-brand-500',
    blue: 'bg-blue-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
  };

  return (
    <div className={cn('space-y-1', className)}>
      {(label || showPercent) && (
        <div className="flex items-center justify-between text-xs">
          {label && <span className="text-text-secondary">{label}</span>}
          {showPercent && <span className="text-text-tertiary font-medium">{pct}%</span>}
        </div>
      )}
      <div className="h-2 bg-surface-tertiary rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', colors[color])}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// Tabs
interface TabsProps {
  tabs: { id: string; label: string; count?: number }[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, active, onChange, className }: TabsProps) {
  return (
    <div className={cn('flex gap-1 p-1 bg-surface-tertiary rounded-lg', className)}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'px-3.5 py-2 text-sm font-medium rounded-md transition-all duration-150',
            active === tab.id
              ? 'bg-surface text-text-primary shadow-sm'
              : 'text-text-secondary hover:text-text-primary'
          )}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className={cn(
              'ml-1.5 text-xs px-1.5 py-0.5 rounded-full',
              active === tab.id ? 'bg-brand-100 text-brand-700' : 'bg-surface text-text-tertiary'
            )}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// Avatar
export function Avatar({
  name,
  src,
  size = 'md',
  className,
}: {
  name: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base' };
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const hue = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;

  if (src) {
    return <img src={src} alt={name} className={cn('rounded-full object-cover', sizes[size], className)} />;
  }

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-semibold text-white',
        sizes[size],
        className
      )}
      style={{ backgroundColor: `hsl(${hue}, 55%, 55%)` }}
    >
      {initials}
    </div>
  );
}
