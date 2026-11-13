import React from 'react';
import { statusLabel } from '@/app/lib/constants';
import { 
  CheckCircle, Clock, AlertTriangle, 
  XCircle, HelpCircle, RefreshCw, FileText 
} from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
  showIcon?: boolean;
}

export function StatusBadge({ status, size = 'sm', showIcon = false }: Readonly<StatusBadgeProps>) {
  const label = statusLabel(status);
  
  const config: Record<string, { color: string; icon: any }> = {
    available: { color: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50", icon: CheckCircle },
    borrowed: { color: "bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-900/20 dark:text-sky-400 dark:border-sky-800/50", icon: RefreshCw },
    returned: { color: "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/10 dark:text-emerald-500 dark:border-emerald-800/30", icon: CheckCircle },
    maintenance: { color: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50", icon: AlertTriangle },
    overdue: { color: "bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:text-red-500 dark:border-red-800/30", icon: Clock },
    pending: { color: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50", icon: HelpCircle },
    approved: { color: "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800/50", icon: CheckCircle },
    rejected: { color: "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700", icon: XCircle },
    requisitioned: { color: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800/50", icon: FileText },
    retired: { color: "bg-slate-800 text-slate-100 border-slate-700 dark:bg-slate-950 dark:text-slate-400 dark:border-slate-800", icon: XCircle },
  };

  const { color, icon: Icon } = config[status] || { color: "bg-slate-100 text-slate-600 border-slate-200", icon: HelpCircle };
  const sizeClasses = size === 'sm' ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-bold border ${color} ${sizeClasses} shadow-sm whitespace-nowrap`}>
      {showIcon && <Icon size={size === 'sm' ? 10 : 12} />}
      {label}
    </span>
  );
}
