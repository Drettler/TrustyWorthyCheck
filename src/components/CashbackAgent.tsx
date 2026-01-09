import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, Gift, Store, Shield, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface CashbackAgentProps {
  variant?: 'full' | 'compact';
}

export function CashbackAgent({ variant = 'full' }: CashbackAgentProps) {
  const [showInterstitial, setShowInterstitial] = useState(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);

  const handleActivateClick = () => {
    setShowInterstitial(true);
    
    // Open link after short delay
    setTimeout(() => {
      window.open('http://www.mrrebates.com?refid=918226', '_blank', 'noopener,noreferrer');
    }, 500);

    // Hide interstitial after 3 seconds
    setTimeout(() => {
      setShowInterstitial(false);
    }, 3000);
  };

  const benefits = [
    { icon: Gift, text: 'Free to join' },
    { icon: Store, text: 'Works at many popular stores' },
    { icon: Shield, text: 'No impact on our safety verdicts' },
  ];

  const howItWorksSteps = [
    'Click Activate Cashback',
    'Create your free Mr. Rebates account',
    'Shop normally and earn cashback',
  ];

  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative"
      >
        <Card className="bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Save money while staying safe</p>
                  <p className="text-sm text-muted-foreground">Earn cashback at trusted stores</p>
                </div>
              </div>
              <Button 
                variant="hero" 
                size="sm" 
                className="gap-2 whitespace-nowrap"
                onClick={handleActivateClick}
              >
                <DollarSign className="w-4 h-4" />
                Activate Cashback
                <ExternalLink className="w-3 h-3 opacity-70" />
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground text-center mt-3">
              Referral link: helps support TrustworthyCheck at no extra cost.
            </p>
          </CardContent>
        </Card>

        {/* Interstitial Overlay */}
        <AnimatePresence>
          {showInterstitial && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-card rounded-2xl p-8 shadow-2xl border text-center max-w-sm mx-4"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-8 h-8 text-white animate-pulse" />
                </div>
                <h3 className="text-xl font-bold mb-2">Sending you to Mr. Rebates securely…</h3>
                <p className="text-muted-foreground">Finish signup to lock in cashback.</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative"
    >
      <Card className="overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <CardContent className="p-8 md:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/25">
              <DollarSign className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl md:text-3xl font-display font-bold mb-3">
              Activate Cashback with Mr. Rebates
            </h3>
            <p className="text-lg text-muted-foreground">
              Earn money back at trusted stores — free to join.
            </p>
          </div>

          {/* CTA Button */}
          <div className="text-center mb-6">
            <Button 
              variant="hero" 
              size="lg" 
              className="gap-2 text-lg px-8 py-6"
              onClick={handleActivateClick}
            >
              <DollarSign className="w-5 h-5" />
              Activate Cashback
              <ExternalLink className="w-4 h-4 opacity-70" />
            </Button>
          </div>

          {/* Disclosure */}
          <p className="text-xs text-muted-foreground text-center mb-8 max-w-md mx-auto">
            Referral link: helps support TrustworthyCheck at no extra cost. We never change safety results based on partners.
          </p>

          {/* Benefits */}
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.text}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3 p-4 rounded-xl bg-background/50 border"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <benefit.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="font-medium text-sm">{benefit.text}</span>
              </motion.div>
            ))}
          </div>

          {/* How It Works Collapsible */}
          <Collapsible open={isHowItWorksOpen} onOpenChange={setIsHowItWorksOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between text-muted-foreground hover:text-foreground">
                <span className="font-medium">How it works</span>
                {isHowItWorksOpen ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="pt-4 pb-2">
                <ol className="space-y-3">
                  {howItWorksSteps.map((step, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center flex-shrink-0">
                        {index + 1}
                      </span>
                      <span className="text-muted-foreground">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      {/* Interstitial Overlay */}
      <AnimatePresence>
        {showInterstitial && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card rounded-2xl p-8 shadow-2xl border text-center max-w-sm mx-4"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-white animate-pulse" />
              </div>
              <h3 className="text-xl font-bold mb-2">Sending you to Mr. Rebates securely…</h3>
              <p className="text-muted-foreground">Finish signup to lock in cashback.</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
