import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Lock, RotateCcw, ShieldCheck, CreditCard, Eye, Zap, Loader2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { resetClientId } from '@/lib/client-id';

interface UpgradePromptProps {
  onResetDemo?: () => void;
}

export function UpgradePrompt({ onResetDemo }: UpgradePromptProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const isDev = useMemo(() => {
    // Never expose limit-bypass tooling in production builds.
    return import.meta.env.DEV;
  }, []);

  const handleUnlockMore = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { type: 'unlock-checks' },
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: 'Payment Failed',
        description: 'Could not initiate payment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDevReset = () => {
    // Local UI counter
    onResetDemo?.();

    // Backend rate limit identity for anonymous users is tied to this browser-stable id.
    // Resetting it is *dev-only* and intended for preview/testing.
    resetClientId();

    try {
      localStorage.removeItem('daily_checks_info');
    } catch {
      // ignore
    }

    toast({
      title: 'Reset complete',
      description: 'Daily limit has been reset for this browser (dev mode).',
    });

    setTimeout(() => {
      window.location.reload();
    }, 250);
  };

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
        You've used your 3 free checks for today. Unlock more checks instantly!
      </p>

      {/* Unlock More Checks CTA */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="max-w-md mx-auto mb-6 rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-secondary/5 to-primary/10 p-6"
      >
        <div className="flex items-center justify-center gap-2 mb-3">
          <Zap className="w-5 h-5 text-primary" />
          <h4 className="font-display text-lg font-bold text-primary">
            Need More Checks?
          </h4>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Get 20 additional website checks with a one-time payment.
        </p>
        <ul className="text-sm text-left space-y-2 mb-5 max-w-xs mx-auto">
          <li className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-success shrink-0" />
            <span>20 extra safety checks</span>
          </li>
          <li className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-success shrink-0" />
            <span>Use anytime (never expires)</span>
          </li>
          <li className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-success shrink-0" />
            <span>Instant activation</span>
          </li>
        </ul>
        <Button
          onClick={handleUnlockMore}
          disabled={isLoading}
          className="w-full h-12 text-base font-bold rounded-xl bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Processing...
            </>
          ) : (
            <>
              Unlock 20 Checks — $4.99
              <ExternalLink className="w-4 h-4 ml-2 opacity-70" />
            </>
          )}
        </Button>
        <p className="text-xs text-muted-foreground mt-3">
          One-time payment • No subscription • Money-back guarantee
        </p>
      </motion.div>

      {/* Extra Protection Section */}
      <div className="max-w-lg mx-auto mb-6 rounded-2xl border border-border/60 bg-card/50 p-6">
        <h4 className="font-display text-base font-semibold mb-2 text-muted-foreground">
          Or wait until tomorrow
        </h4>
        <p className="text-sm text-muted-foreground mb-4">
          Your free checks reset every 24 hours. In the meantime, protect yourself:
        </p>
        <div className="flex flex-col gap-3">
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2"
            asChild
          >
            <a href="https://www.identityguard.com/" target="_blank" rel="noopener noreferrer">
              <ShieldCheck className="w-4 h-4" />
              Protect My Identity
            </a>
          </Button>
          <Button
            variant="outline"
            size="sm"
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
            size="sm"
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

      {/* Dev-only: reset both local counter + anonymous identifier used by backend rate limiting */}
      {isDev && onResetDemo && (
        <div className="max-w-lg mx-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDevReset}
            className="gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Dev: Reset daily limit
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            Dev-only (preview): resets this browser’s anonymous rate-limit id.
          </p>
        </div>
      )}
    </motion.div>
  );
}
