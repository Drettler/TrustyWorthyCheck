import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, FileText, AlertTriangle, CheckCircle, Shield, Loader2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useDailyChecks } from '@/hooks/use-daily-checks';
import { UpgradePrompt } from './UpgradePrompt';
import { analyzeSocialSeller, type SocialSellerResult } from '@/lib/api/social-seller';

export function SocialSellerChecker() {
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SocialSellerResult | null>(null);
  const { toast } = useToast();
  const { isLimitReached, useCheck, resetForDemo, checksRemaining } = useDailyChecks();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() && !bio.trim()) {
      toast({
        title: 'Input Required',
        description: 'Please enter a username or bio to analyze.',
        variant: 'destructive',
      });
      return;
    }

    // Check daily limit before proceeding
    if (!useCheck()) {
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const analysisResult = await analyzeSocialSeller(
        username.trim() || undefined,
        bio.trim() || undefined
      );
      setResult(analysisResult);
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: 'Analysis Failed',
        description: error instanceof Error ? error.message : 'Could not analyze. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setUsername('');
    setBio('');
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-amber-700 dark:text-amber-400';
      case 'medium': return 'text-amber-600 dark:text-amber-400';
      default: return 'text-emerald-600 dark:text-emerald-400';
    }
  };

  const getRiskBgColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-amber-50 dark:bg-amber-950/30 border-amber-400 dark:border-amber-600';
      case 'medium': return 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-500/30';
      default: return 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-500/30';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-status-danger';
      case 'medium': return 'text-status-warning';
      default: return 'text-muted-foreground';
    }
  };

  // Show upgrade prompt if limit reached and no result displayed
  if (isLimitReached && !result) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <UpgradePrompt onResetDemo={resetForDemo} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        {!result ? (
          <motion.form
            key="form"
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Username Input */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                <User className="w-4 h-4 text-primary" />
                Seller Username
              </label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g., best_deals_2024 or @shop_name"
                className="h-12"
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                We'll check for impersonation patterns, suspicious characters, and red flag keywords
              </p>
            </div>

            {/* Bio Input */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                <FileText className="w-4 h-4 text-primary" />
                Seller Bio / Description
              </label>
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Paste the seller's bio or profile description here..."
                className="min-h-[120px] resize-none"
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                AI will analyze for urgency tactics, suspicious claims, and scam patterns
              </p>
            </div>


            <Button
              type="submit"
              variant="hero"
              size="lg"
              disabled={isLoading || (!username.trim() && !bio.trim())}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  Analyze Seller
                </>
              )}
            </Button>
          </motion.form>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Risk Score Header */}
            <div className={`rounded-xl border-2 p-6 ${getRiskBgColor(result.riskLevel)}`}>
              {result.riskLevel === 'high' && (
                <motion.div 
                  className="flex items-center justify-center gap-2 mb-4 text-amber-700 dark:text-amber-400 font-medium"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <span className="tracking-wide text-sm">Unable to verify key trust indicators — review details</span>
                </motion.div>
              )}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {result.riskLevel === 'high' ? '❌' : 
                     result.riskLevel === 'medium' ? '⚠️' : '✅'}
                  </span>
                  <div>
                    <h3 className={`text-xl font-bold ${getRiskColor(result.riskLevel)}`}>
                      {result.riskLevel === 'high' ? 'High Risk / Not Verified' : 
                       result.riskLevel === 'medium' ? 'Mixed / Use Caution' : 'Likely Legit'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Trust Score: {100 - result.riskScore}/100
                    </p>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                  Free Preview
                </span>
              </div>
              <p className="text-sm text-foreground">{result.summary}</p>
            </div>

            {/* Concerns */}
            {result.redFlags.length > 0 && (
              <div className="glass-card rounded-xl p-5 space-y-3">
                <h4 className="font-semibold flex items-center gap-2 text-status-danger">
                  <AlertTriangle className="w-4 h-4" />
                  Concerns Found ({result.redFlags.length})
                </h4>
                <ul className="space-y-2">
                  {result.redFlags.map((flag, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className={`mt-0.5 ${getSeverityColor(flag.severity)}`}>•</span>
                      <span>
                        <span className="text-muted-foreground capitalize">[{flag.type}]</span>{' '}
                        {flag.description}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Positive Indicators */}
            {result.positiveSignals.length > 0 && (
              <div className="glass-card rounded-xl p-5 space-y-3">
                <h4 className="font-semibold flex items-center gap-2 text-status-safe">
                  <CheckCircle className="w-4 h-4" />
                  Positive Indicators ({result.positiveSignals.length})
                </h4>
                <ul className="space-y-2">
                  {result.positiveSignals.map((signal, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-status-safe mt-0.5">✓</span>
                      <span>{signal}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Disclaimer + Monetization */}
            <div className="space-y-3">
              <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
                <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p>
                  This analysis is based on pattern detection and AI assessment. Always verify sellers through 
                  platform reviews, payment protection, and direct communication before making purchases.
                </p>
              </div>
              
              {/* Monetization teaser */}
              <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Want deeper analysis?</span> Full reports include profile history, engagement authenticity scoring, and cross-platform verification.
                  <span className="text-primary font-medium ml-1">Coming soon</span>
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="lg"
              onClick={handleReset}
              className="w-full"
            >
              Check Another Seller
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
