import { motion } from 'framer-motion';
import { Lock, Zap, Check, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UpgradePromptProps {
  onResetDemo?: () => void;
}

export function UpgradePrompt({ onResetDemo }: UpgradePromptProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-8 px-6"
    >
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
        <Lock className="w-8 h-8 text-primary" />
      </div>
      
      <h3 className="font-display text-2xl font-bold mb-2">
        Daily Limit Reached
      </h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        You've used your free check for today. Upgrade to get unlimited checks and detailed reports.
      </p>

      <div className="glass-card rounded-xl p-6 max-w-sm mx-auto mb-6">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-primary" />
          <span className="font-semibold text-lg">Pro Plan</span>
        </div>
        
        <ul className="space-y-2 text-sm text-left mb-6">
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-success" />
            Unlimited daily checks
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-success" />
            Full detailed reports
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-success" />
            WHOIS & domain history
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-success" />
            Priority analysis speed
          </li>
        </ul>

        <Button variant="hero" size="lg" className="w-full" disabled>
          Coming Soon
        </Button>
        <p className="text-xs text-muted-foreground mt-2">
          Paid plans launching soon
        </p>
      </div>

      <p className="text-sm text-muted-foreground mb-3">
        Come back tomorrow for another free check
      </p>

      {onResetDemo && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onResetDemo}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="w-3 h-3 mr-1" />
          Reset for demo
        </Button>
      )}
    </motion.div>
  );
}
