import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnalysisCardProps {
  title: string;
  icon: LucideIcon;
  status?: 'success' | 'warning' | 'danger' | 'neutral';
  children: React.ReactNode;
  delay?: number;
}

export function AnalysisCard({ title, icon: Icon, status = 'neutral', children, delay = 0 }: AnalysisCardProps) {
  const getStatusStyles = () => {
    switch (status) {
      case 'success': return 'border-success/30 bg-success/5';
      case 'warning': return 'border-warning/30 bg-warning/5';
      case 'danger': return 'border-danger/30 bg-danger/5';
      default: return 'border-border bg-card';
    }
  };

  const getIconStyles = () => {
    switch (status) {
      case 'success': return 'text-success bg-success/10';
      case 'warning': return 'text-warning bg-warning/10';
      case 'danger': return 'text-danger bg-danger/10';
      default: return 'text-primary bg-primary/10';
    }
  };

  return (
    <motion.div
      className={cn(
        'rounded-xl border p-5 card-shadow',
        getStatusStyles()
      )}
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay, duration: 0.4 }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={cn('p-2 rounded-lg', getIconStyles())}>
          <Icon className="w-5 h-5" />
        </div>
        <h3 className="font-display font-semibold text-lg">{title}</h3>
      </div>
      {children}
    </motion.div>
  );
}
