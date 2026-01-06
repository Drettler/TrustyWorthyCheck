import { Check, X, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CheckItemProps {
  label: string;
  status: 'pass' | 'fail' | 'warning';
}

export function CheckItem({ label, status }: CheckItemProps) {
  const getIcon = () => {
    switch (status) {
      case 'pass':
        return <Check className="w-4 h-4 text-success" />;
      case 'fail':
        return <X className="w-4 h-4 text-danger" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-warning" />;
    }
  };

  const getTextColor = () => {
    switch (status) {
      case 'pass': return 'text-foreground';
      case 'fail': return 'text-muted-foreground';
      case 'warning': return 'text-warning';
    }
  };

  return (
    <div className="flex items-center gap-2 py-1.5">
      <div className={cn(
        'w-6 h-6 rounded-full flex items-center justify-center',
        status === 'pass' ? 'bg-success/10' :
        status === 'fail' ? 'bg-danger/10' :
        'bg-warning/10'
      )}>
        {getIcon()}
      </div>
      <span className={cn('text-sm', getTextColor())}>{label}</span>
    </div>
  );
}
