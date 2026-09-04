import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format paise as INR string: 600000 → "₹6,000" */
export function formatINR(paise: number): string {
  const rupees = paise / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(rupees);
}

/** Format date to readable string */
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/** Relative time: "2 days ago", "just now" */
export function timeAgo(date: Date | string): string {
  const now = new Date();
  const then = new Date(date);
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  return formatDate(date);
}

/** Generate a case ID like UN-DMG-00452 */
export function generateCaseId(prefix: string): string {
  const num = Math.floor(Math.random() * 99999);
  return `UN-${prefix}-${String(num).padStart(5, '0')}`;
}

/** Calculate true monthly cost */
export function calcTrueMonthlyCost(params: {
  rent: number;
  electricityEstimate?: number;
  wifiCharge?: number;
  foodCharge?: number;
  maintenanceCharge?: number;
  laundryCharge?: number;
}): number {
  return (
    params.rent +
    (params.electricityEstimate || 0) +
    (params.wifiCharge || 0) +
    (params.foodCharge || 0) +
    (params.maintenanceCharge || 0) +
    (params.laundryCharge || 0)
  );
}

/** Truncate text with ellipsis */
export function truncate(str: string, len: number): string {
  if (str.length <= len) return str;
  return str.slice(0, len) + '…';
}

/** Bed status color mapping */
export function bedStatusColor(status: string): string {
  const colors: Record<string, string> = {
    AVAILABLE: 'bg-emerald-100 text-emerald-800',
    RESERVED: 'bg-amber-100 text-amber-800',
    OCCUPIED: 'bg-blue-100 text-blue-800',
    NOTICE_PERIOD: 'bg-orange-100 text-orange-800',
    MAINTENANCE_HOLD: 'bg-red-100 text-red-800',
    BLOCKED: 'bg-gray-100 text-gray-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

/** Verification status color */
export function verificationStatusColor(status: string): string {
  const colors: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-700',
    SUBMITTED: 'bg-blue-100 text-blue-700',
    UNDER_REVIEW: 'bg-amber-100 text-amber-700',
    VERIFIED: 'bg-emerald-100 text-emerald-700',
    NEEDS_RECHECK: 'bg-orange-100 text-orange-700',
    SUSPENDED: 'bg-red-100 text-red-700',
  };
  return colors[status] || 'bg-gray-100 text-gray-700';
}
