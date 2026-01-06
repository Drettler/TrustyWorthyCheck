import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface FlagsListProps {
  items: string[];
  type: 'red' | 'green';
}

export function FlagsList({ items, type }: FlagsListProps) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic">
        {type === 'red' ? 'No red flags detected' : 'No positive signals found'}
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <motion.div
          key={index}
          className={`flex items-start gap-2 p-2 rounded-lg ${
            type === 'red' ? 'bg-danger/10' : 'bg-success/10'
          }`}
          initial={{ x: -10, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: index * 0.1 }}
        >
          {type === 'red' ? (
            <AlertTriangle className="w-4 h-4 text-danger mt-0.5 shrink-0" />
          ) : (
            <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
          )}
          <span className={`text-sm ${type === 'red' ? 'text-danger' : 'text-success'}`}>
            {item}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
