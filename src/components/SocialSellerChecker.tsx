import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, FileText, AlertTriangle, CheckCircle, Shield, Loader2, XCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { analyzeSocialSeller, type SocialSellerResult } from '@/lib/api/social-seller';

export function SocialSellerChecker() {
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SocialSellerResult | null>(null);
  const { toast } = useToast();

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
      case 'high': return 'text-status-danger';
      case 'medium': return 'text-status-warning';
      default: return 'text-status-safe';
    }
  };

  const getRiskBgColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-950/60 border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.2)]';
      case 'medium': return 'bg-amber-950/40 border-amber-500/40';
      default: return 'bg-status-safe/10 border-status-safe/20';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-status-danger';
      case 'medium': return 'text-status-warning';
      default: return 'text-muted-foreground';
    }
  };

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
                  className="flex items-center justify-center gap-2 mb-4 text-red-400 font-semibold"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <XCircle className="w-5 h-5" />
                  <span className="uppercase tracking-wide text-sm">Warning: High Risk Seller</span>
                  <XCircle className="w-5 h-5" />
                </motion.div>
              )}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {result.riskLevel === 'high' ? (
                    <XCircle className={`w-8 h-8 ${getRiskColor(result.riskLevel)}`} />
                  ) : result.riskLevel === 'medium' ? (
                    <AlertTriangle className={`w-8 h-8 ${getRiskColor(result.riskLevel)}`} />
                  ) : (
                    <CheckCircle className={`w-8 h-8 ${getRiskColor(result.riskLevel)}`} />
                  )}
                  <div>
                    <h3 className={`text-xl font-bold ${getRiskColor(result.riskLevel)}`}>
                      {result.riskLevel === 'high' ? 'High Risk' : 
                       result.riskLevel === 'medium' ? 'Medium Risk' : 'Low Risk'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Risk Score: {result.riskScore}/100
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-foreground">{result.summary}</p>
            </div>

            {/* Red Flags */}
            {result.redFlags.length > 0 && (
              <div className="glass-card rounded-xl p-5 space-y-3">
                <h4 className="font-semibold flex items-center gap-2 text-status-danger">
                  <AlertTriangle className="w-4 h-4" />
                  Red Flags ({result.redFlags.length})
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

            {/* Positive Signals */}
            {result.positiveSignals.length > 0 && (
              <div className="glass-card rounded-xl p-5 space-y-3">
                <h4 className="font-semibold flex items-center gap-2 text-status-safe">
                  <CheckCircle className="w-4 h-4" />
                  Positive Signals ({result.positiveSignals.length})
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

            {/* Disclaimer */}
            <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
              <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>
                This analysis is based on pattern detection and AI assessment. Always verify sellers through 
                platform reviews, payment protection, and direct communication before making purchases.
              </p>
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
