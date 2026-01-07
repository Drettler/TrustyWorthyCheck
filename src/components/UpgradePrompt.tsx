import { motion } from 'framer-motion';
import { Lock, RotateCcw, ShieldCheck, CreditCard, Eye } from 'lucide-react';
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
        You've used your free checks for today. Come back tomorrow for more free checks!
      </p>

      {/* Extra Protection Section */}
      <div className="max-w-lg mx-auto mb-6 rounded-2xl border border-border/60 bg-gradient-to-br from-primary/5 via-background to-primary/5 p-6">
        <h4 className="font-display text-lg font-semibold mb-2">
          Protect Yourself While You Wait
        </h4>
        <p className="text-sm text-muted-foreground mb-4">
          These trusted tools help prevent identity theft and fraud.
        </p>
        <div className="flex flex-col gap-3">
          <Button
            variant="outline"
            className="w-full gap-2"
            asChild
          >
            <a href="https://www.aura.com/lp/identity-theft-protection" target="_blank" rel="noopener noreferrer">
              <ShieldCheck className="w-4 h-4" />
              Protect My Identity
            </a>
          </Button>
          <Button
            variant="outline"
            className="w-full gap-2"
            asChild
          >
            <a href="https://www.experian.com/consumer-products/credit-monitoring.html" target="_blank" rel="noopener noreferrer">
              <CreditCard className="w-4 h-4" />
              Monitor My Credit
            </a>
          </Button>
          <Button
            variant="outline"
            className="w-full gap-2"
            asChild
          >
            <a href="https://www.identityguard.com/dark-web-monitoring" target="_blank" rel="noopener noreferrer">
              <Eye className="w-4 h-4" />
              Dark Web Monitoring
            </a>
          </Button>
        </div>
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
