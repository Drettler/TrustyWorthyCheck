import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Zap, Check, RotateCcw, Crown, FileText, Ticket, Loader2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UpgradePromptProps {
  onResetDemo?: () => void;
  onSubscriptionVerified?: (email: string) => Promise<boolean>;
}

export function UpgradePrompt({ onResetDemo, onSubscriptionVerified }: UpgradePromptProps) {
  const [couponCode, setCouponCode] = useState('');
  const [isLoading, setIsLoading] = useState<'payPerCheck' | 'proMonthly' | 'verifying' | null>(null);
  const [email, setEmail] = useState('');
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'payPerCheck' | 'proMonthly' | null>(null);

  const handleVerifySubscription = async () => {
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    setIsLoading('verifying');
    try {
      const isSubscribed = await onSubscriptionVerified?.(email);
      if (isSubscribed) {
        toast.success('Pro subscription verified! You now have unlimited checks.');
      } else {
        toast.error('No active subscription found for this email.');
      }
    } catch (err) {
      console.error('Verification error:', err);
      toast.error('Failed to verify subscription. Please try again.');
    } finally {
      setIsLoading(null);
    }
  };

  const handleCheckout = async (priceType: 'payPerCheck' | 'proMonthly') => {
    if (!email && !showEmailInput) {
      setSelectedPlan(priceType);
      setShowEmailInput(true);
      return;
    }

    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    setIsLoading(priceType);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          priceType, 
          email,
          couponCode: priceType === 'proMonthly' ? couponCode : undefined 
        },
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      toast.error('Failed to start checkout. Please try again.');
    } finally {
      setIsLoading(null);
    }
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
        You've used your free check for today. Unlock full reports with one of our plans.
      </p>

      {/* Email Input */}
      {showEmailInput && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="max-w-sm mx-auto mb-6"
        >
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-3"
          />
          <div className="flex gap-2">
            <Button 
              onClick={() => selectedPlan && handleCheckout(selectedPlan)}
              disabled={!email || isLoading !== null}
              className="flex-1"
            >
              {isLoading === 'payPerCheck' || isLoading === 'proMonthly' ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Continue to Checkout'
              )}
            </Button>
          </div>
        </motion.div>
      )}

      {/* Already subscribed? Verify */}
      {onSubscriptionVerified && (
        <div className="max-w-sm mx-auto mb-6 p-4 rounded-xl bg-primary/5 border border-primary/20">
          <div className="flex items-center gap-2 mb-3">
            <Mail className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Already a Pro subscriber?</span>
          </div>
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="Enter your subscription email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="text-sm"
            />
            <Button 
              variant="outline"
              size="sm"
              onClick={handleVerifySubscription}
              disabled={!email || isLoading !== null}
            >
              {isLoading === 'verifying' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Verify'
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto mb-6">
        {/* Pay-Per-Check - Best for You */}
        <div className="glass-card rounded-xl p-6 border-2 border-primary relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
            🥇 Best for You
          </div>
          
          <div className="flex items-center justify-center gap-2 mb-2 mt-2">
            <FileText className="w-5 h-5 text-primary" />
            <span className="font-semibold text-lg">Pay-Per-Check</span>
          </div>
          
          <div className="text-3xl font-bold mb-1">$4.99</div>
          <p className="text-sm text-muted-foreground mb-4">One full report</p>
          
          <ul className="space-y-2 text-sm text-left mb-6">
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-success flex-shrink-0" />
              Complete detailed analysis
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-success flex-shrink-0" />
              Printable PDF report
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-success flex-shrink-0" />
              Saved to your history
            </li>
          </ul>

          <p className="text-xs text-muted-foreground mb-4 italic">
            Perfect for parents, elderly helpers, and one-off fraud checks
          </p>

          <Button 
            variant="hero" 
            size="lg" 
            className="w-full" 
            onClick={() => handleCheckout('payPerCheck')}
            disabled={isLoading !== null}
          >
            {isLoading === 'payPerCheck' ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              'Get Report'
            )}
          </Button>
        </div>

        {/* Pro Monthly Subscription */}
        <div className="glass-card rounded-xl p-6 border border-border">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Crown className="w-5 h-5 text-amber-500" />
            <span className="font-semibold text-lg">Pro Monthly</span>
          </div>
          <div className="text-xs text-muted-foreground mb-2">🥈 For frequent users</div>
          
          <div className="text-3xl font-bold mb-1">$9.99<span className="text-lg font-normal text-muted-foreground">/mo</span></div>
          <p className="text-sm text-muted-foreground mb-4">Unlimited checks</p>
          
          <ul className="space-y-2 text-sm text-left mb-4">
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-success flex-shrink-0" />
              Unlimited daily checks
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-success flex-shrink-0" />
              Full detailed reports
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-success flex-shrink-0" />
              WHOIS & domain history
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-success flex-shrink-0" />
              Priority analysis speed
            </li>
          </ul>

          {/* Coupon Code Input */}
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <Ticket className="w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="text-sm h-9"
              />
            </div>
          </div>

          <Button 
            variant="outline" 
            size="lg" 
            className="w-full" 
            onClick={() => handleCheckout('proMonthly')}
            disabled={isLoading !== null}
          >
            {isLoading === 'proMonthly' ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Subscribe
              </>
            )}
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
