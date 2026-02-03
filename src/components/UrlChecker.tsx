import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Shield, Globe, Building2, AlertTriangle, CheckCircle, DollarSign, Users, ExternalLink, Clock, Image, ChevronDown, ChevronUp, Lock, FileText, Sparkles, Infinity as InfinityIcon, ShieldCheck, Calendar, TrendingDown, Heart, X, ShieldAlert, Eye, CreditCard, ShieldPlus, Store, Flag, Coins, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TrustScoreGauge } from './TrustScoreGauge';
import { AnalysisCard } from './AnalysisCard';
import { CheckItem } from './CheckItem';
import { FlagsList } from './FlagsList';
import { ScanningAnimation } from './ScanningAnimation';
import { UpgradePrompt } from './UpgradePrompt';
import { ScamWarningBanner } from './ScamWarningBanner';
import { DetailedReportUpsell } from './DetailedReportUpsell';
import { ReportSiteDialog } from './ReportSiteDialog';
import { analyzeUrl, type AnalysisResult, type AnalysisError } from '@/lib/api/url-check';
import { useToast } from '@/hooks/use-toast';
import { useUrlHistory } from '@/hooks/use-url-history';
import { useDailyChecks } from '@/hooks/use-daily-checks';
import { supabase } from '@/integrations/supabase/client';

export function UrlChecker() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [scanStage, setScanStage] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showGovScamAlert, setShowGovScamAlert] = useState(false);
  const [forRelativeMode, setForRelativeMode] = useState(false);
  const { addToHistory } = useUrlHistory();
  const { toast } = useToast();
  const { isLimitReached, useCheck, resetForDemo, checksRemaining, maxChecks, updateFromResponse } = useDailyChecks();
  const hasAutoChecked = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputHighlight, setInputHighlight] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showFullReport, setShowFullReport] = useState(false);
  
  // Focus and highlight input when navigating to #checker
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#checker' && inputRef.current) {
        inputRef.current.focus();
        setInputHighlight(true);
        setTimeout(() => setInputHighlight(false), 1500);
      }
    };
    
    // Check on mount
    handleHashChange();
    
    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Handle ?check= URL parameter from Chrome extension
  useEffect(() => {
    const checkUrl = searchParams.get('check');
    if (checkUrl && !hasAutoChecked.current) {
      hasAutoChecked.current = true;
      setUrl(checkUrl);

      // Clear ONLY the `check` parameter (preserve others like ?testReport=true)
      const next = new URLSearchParams(searchParams);
      next.delete('check');
      setSearchParams(next, { replace: true });

      // Auto-submit after a brief delay to allow state to update
      setTimeout(() => {
        if (isValidUrl(checkUrl) && !isLimitReached) {
          handleAutoSubmit(checkUrl);
        }
      }, 100);
    }
  }, [searchParams]);

  const handleAutoSubmit = async (urlToCheck: string) => {
    // Flip into loading state first so the UI never swaps to the limit screen mid-check
    setIsLoading(true);
    setScanStage(0);
    setResult(null);

    // Check daily limit (consume one check)
    if (!useCheck()) {
      setIsLoading(false);
      setScanStage(0);
      return;
    }

    try {
      const analysisResult = await analyzeUrl(urlToCheck);
      setResult(analysisResult);
      addToHistory(urlToCheck, analysisResult);
    } catch (error) {
      console.error('Analysis error:', error);
      handleAnalysisError(error);
    } finally {
      setIsLoading(false);
      setScanStage(0);
    }
  };

  const handleUnlockFullReport = async () => {
    setIsPaymentLoading(true);
    try {
      // Store the current analysis result in localStorage (works across tabs)
      if (result) {
        localStorage.setItem('pendingAnalysisResult', JSON.stringify(result));
        localStorage.setItem('pendingAnalysisUrl', url);
      }
      
      const { data, error } = await supabase.functions.invoke('create-payment');
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: 'Payment Error',
        description: 'Could not start the payment process. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsPaymentLoading(false);
    }
  };


  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isLoading) {
      interval = setInterval(() => {
        setScanStage(prev => (prev < 3 ? prev + 1 : prev));
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  // Basic URL validation
  const isValidUrl = (input: string): boolean => {
    const trimmed = input.trim();
    // Must not contain spaces (except possibly in encoded form)
    if (trimmed.includes(' ')) return false;
    // Must look like a domain or URL
    const urlPattern = /^(https?:\/\/)?[\w.-]+\.[a-z]{2,}(\/.*)?$/i;
    return urlPattern.test(trimmed);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    // Validate URL format before sending
    if (!isValidUrl(url)) {
      toast({
        title: 'Invalid URL',
        description: 'Please enter a valid website URL (e.g., example.com or https://example.com)',
        variant: 'destructive',
      });
      return;
    }

    // Flip into loading state first so the UI never swaps to the limit screen mid-check
    setIsLoading(true);
    setScanStage(0);
    setResult(null);

    // Check daily limit (consume one check)
    if (!useCheck()) {
      setIsLoading(false);
      setScanStage(0);
      return;
    }

    try {
      const analysisResult = await analyzeUrl(url);
      setResult(analysisResult);
      addToHistory(url, analysisResult);
    } catch (error) {
      console.error('Analysis error:', error);
      handleAnalysisError(error);
    } finally {
      setIsLoading(false);
      setScanStage(0);
    }
  };

  const handleAnalysisError = (error: unknown) => {
    // Check if it's a typed error
    if (error && typeof error === 'object' && 'type' in error) {
      const typedError = error as AnalysisError;
      
      if (typedError.type === 'rate_limit') {
        updateFromResponse(typedError.remaining, typedError.limit, typedError.resetAt);
        toast({
          title: 'Daily Limit Reached',
          description: typedError.message,
          variant: 'destructive',
        });
      } else if (typedError.type === 'ssl_error') {
        toast({
          title: '⚠️ SSL Security Warning',
          description: typedError.message,
          variant: 'destructive',
        });
      } else if (typedError.type === 'scrape_failed') {
        toast({
          title: 'Website Unavailable',
          description: typedError.message,
          variant: 'destructive',
        });
      }
    } else {
      toast({
        title: 'Analysis Failed',
        description: error instanceof Error ? error.message : 'Could not analyze this URL. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleNewCheck = () => {
    setResult(null);
    setUrl('');
    setShowDetails(false);
  };

  // Show upgrade prompt if limit reached and no result displayed (but never interrupt an in-flight check)
  if (isLimitReached && !result && !isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <UpgradePrompt onResetDemo={resetForDemo} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Preset Buttons */}
      <motion.div
        className="mb-4 flex flex-wrap gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {/* Government & Subscription Alert Preset */}
        <button
          type="button"
          onClick={() => setShowGovScamAlert(!showGovScamAlert)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
            showGovScamAlert
              ? 'bg-warning/10 border-warning/40 text-warning'
              : 'bg-card border-border hover:border-primary/50 text-muted-foreground hover:text-foreground'
          }`}
        >
          <Shield className="w-4 h-4" />
          Is this a DMV, IRS, Norton, or McAfee message?
        </button>

        {/* Check for Parent/Relative Button */}
        <button
          type="button"
          onClick={() => setForRelativeMode(!forRelativeMode)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
            forRelativeMode
              ? 'bg-primary/10 border-primary/40 text-primary'
              : 'bg-card border-border hover:border-primary/50 text-muted-foreground hover:text-foreground'
          }`}
        >
          <Heart className="w-4 h-4" />
          Check a site for a parent or relative
        </button>
      </motion.div>

      {/* Government Alert Banner */}
      <AnimatePresence>
        {showGovScamAlert && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 overflow-hidden"
          >
            <div className="rounded-xl p-4 bg-warning/10 border-2 border-warning/30">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-warning">Important: Government & Subscription Fraud Warning</h3>
                    <button 
                      onClick={() => setShowGovScamAlert(false)}
                      className="text-muted-foreground hover:text-foreground p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-foreground/80 mt-1">
                    <strong>Government agencies</strong> (IRS, DMV, SSA) and <strong>major software companies</strong> (Norton, McAfee, Microsoft) <strong>do not demand immediate payment via email or text links</strong>.
                  </p>
                  <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                    <li>• The IRS will <strong>never</strong> call or email demanding immediate payment</li>
                    <li>• Norton/McAfee renewal notices with "call this number" are almost always fraudulent</li>
                    <li>• When in doubt, go directly to the official website by typing it yourself</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Relative Mode Banner */}
      <AnimatePresence>
        {forRelativeMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 overflow-hidden"
          >
            <div className="rounded-xl p-4 bg-primary/10 border-2 border-primary/30">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-primary">Helping a Parent or Relative?</h3>
                    <button 
                      onClick={() => setForRelativeMode(false)}
                      className="text-muted-foreground hover:text-foreground p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-foreground/80 mt-1">
                    Great idea! Paste the link they received and we'll check if it's safe.
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    💡 <strong>Tip:</strong> Have them forward suspicious emails/texts to you, then paste the links here.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Form Card */}
      <motion.div
        className="mb-4 p-6 rounded-2xl bg-card/80 backdrop-blur-sm border border-border/60 shadow-lg"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {/* Card Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-display font-bold text-lg">Start Your Safety Check</h2>
            <p className="text-sm text-muted-foreground">Takes less than 3 minutes</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* URL Input - Required */}
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Globe className="w-5 h-5" />
            </div>
            <Input
              ref={inputRef}
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste the site link here 👆"
              className={`pl-12 h-14 text-base bg-background border-border focus:border-primary rounded-xl transition-all duration-300 ${
                inputHighlight ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''
              }`}
              disabled={isLoading}
            />
          </div>

          {/* Optional Fields */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <FileText className="w-4 h-4" />
              </div>
              <Input
                type="text"
                placeholder="Optional — helps us be extra accurate"
                className="pl-10 h-11 text-sm bg-background border-border focus:border-primary rounded-xl"
                disabled={isLoading}
              />
            </div>
            <div className="flex-1 relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Building2 className="w-4 h-4" />
              </div>
              <Input
                type="text"
                placeholder="Where the business says it's located"
                className="pl-10 h-11 text-sm bg-background border-border focus:border-primary rounded-xl"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Submit Button - Full Width Gradient */}
          <Button
            type="submit"
            disabled={isLoading || !url.trim()}
            className="w-full h-14 text-lg font-bold rounded-xl bg-gradient-to-r from-primary via-primary to-secondary hover:opacity-90 transition-opacity shadow-lg"
          >
            {isLoading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Shield className="w-5 h-5 mr-2" />
                </motion.div>
                Analyzing...
              </>
            ) : (
              <>
                Run Safety Check 🚀
              </>
            )}
          </Button>
        </form>

        {/* Check Counter */}
        <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-border/30">
          <div className="flex items-center gap-1.5 text-sm">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">Daily checks:</span>
            <span className={`font-bold ${checksRemaining <= 1 ? 'text-warning' : 'text-primary'}`}>
              {checksRemaining}
            </span>
            <span className="text-muted-foreground">/ {maxChecks} remaining</span>
          </div>
        </div>
      </motion.div>
      {/* Loading State */}
      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ScanningAnimation currentStage={scanStage} />
          </motion.div>
        )}

        {/* Results */}
        {result && !isLoading && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Scam-Specific Warning Banners */}
            {result.scamIndicators && (
              <ScamWarningBanner scamIndicators={result.scamIndicators} />
            )}

            {/* Warning Banner for Danger/Caution (only show if no scam-specific banner) */}
            {(result.verdict === 'danger' || result.verdict === 'caution') && 
             !result.scamIndicators?.government?.isLikelyScam && 
             !result.scamIndicators?.subscription?.isLikelyScam && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-xl p-4 flex items-start gap-3 ${
                  result.verdict === 'danger'
                    ? 'bg-danger/10 border-2 border-danger/30'
                    : 'bg-warning/10 border-2 border-warning/30'
                }`}
              >
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  result.verdict === 'danger' ? 'bg-danger/20' : 'bg-warning/20'
                }`}>
                  <AlertTriangle className={`w-5 h-5 ${
                    result.verdict === 'danger' ? 'text-danger' : 'text-warning'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-semibold text-sm ${
                    result.verdict === 'danger' ? 'text-danger' : 'text-warning'
                  }`}>
                    {result.verdict === 'danger' 
                      ? 'High Risk Website Detected' 
                      : 'Proceed With Caution'}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {result.verdict === 'danger'
                      ? 'Multiple red flags were identified. We recommend avoiding transactions on this website.'
                      : 'Some concerns were found. Review the details below before proceeding.'}
                  </p>
                </div>
              </motion.div>
            )}
            {/* Results Header Card */}
            <div className="rounded-2xl overflow-hidden border border-border/60">
              {/* Website Info Header */}
              <div className="px-6 py-4 bg-foreground/[0.03] dark:bg-foreground/[0.08] border-b border-border/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-card border border-border flex items-center justify-center">
                      <Globe className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="font-display text-lg font-semibold truncate">
                        {result.scrapedData?.title || result.details.domain.name}
                      </h2>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="truncate">{result.details.domain.name}</span>
                        {result.details.domain.ssl && (
                          <span className="flex items-center gap-1 text-success text-xs font-medium bg-success/10 px-2 py-0.5 rounded-full">
                            <Shield className="w-3 h-3" />
                            SSL Secured
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Trust Score Section */}
              <div className="p-8 flex flex-col items-center">
                <TrustScoreGauge 
                  score={result.trustScore} 
                  verdict={result.verdict} 
                  redFlagsCount={result.details.redFlags?.length || 0}
                  confidence={result.confidence}
                />
              </div>
            </div>

            {/* Savings Promotion Box - Only show for safe or caution sites */}
            {/* Action Buttons Based on Findings */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="flex flex-wrap justify-center gap-3"
            >
              {/* Report to FTC - show for suspicious sites */}
              {(result.verdict === 'danger' || result.verdict === 'caution') && (
                <Button
                  variant="outline"
                  className="h-auto py-3 px-4 flex items-center gap-3 justify-start bg-card hover:bg-warning/5 hover:border-warning/40 group"
                  asChild
                >
                  <a href="https://reportfraud.ftc.gov/" target="_blank" rel="noopener noreferrer">
                    <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center flex-shrink-0 group-hover:bg-warning/20 transition-colors">
                      <ShieldAlert className="w-5 h-5 text-warning" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-sm">Report to FTC</p>
                      <p className="text-xs text-muted-foreground">File official fraud report</p>
                    </div>
                  </a>
                </Button>
              )}

              {/* Activate Cashback - show for safe/caution sites */}
              {(result.verdict === 'safe' || result.verdict === 'caution') && (
                <Button
                  variant="outline"
                  className="h-auto py-3 px-4 flex items-center gap-3 justify-start bg-card hover:bg-success/5 hover:border-success/40 group"
                  asChild
                >
                  <a href="http://www.mrrebates.com?refid=918226" target="_blank" rel="noopener noreferrer">
                    <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0 group-hover:bg-success/20 transition-colors">
                      <Coins className="w-5 h-5 text-success" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-sm">Activate Cashback</p>
                      <p className="text-xs text-muted-foreground">Save money on purchases</p>
                    </div>
                  </a>
                </Button>
              )}

              {/* Report This Site - always show */}
              <Button
                variant="outline"
                className="h-auto py-3 px-4 flex items-center gap-3 justify-start bg-card hover:bg-danger/5 hover:border-danger/40 group"
                onClick={() => setShowReportDialog(true)}
              >
                <div className="w-10 h-10 rounded-lg bg-danger/10 flex items-center justify-center flex-shrink-0 group-hover:bg-danger/20 transition-colors">
                  <Flag className="w-5 h-5 text-danger" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-sm">Report This Site</p>
                  <p className="text-xs text-muted-foreground">Flag suspicious activity</p>
                </div>
              </Button>

              {/* Share on Twitter/X */}
              <Button
                variant="outline"
                className="h-auto py-3 px-4 flex items-center gap-3 justify-start bg-card hover:bg-[#1DA1F2]/5 hover:border-[#1DA1F2]/40 group"
                asChild
              >
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                    `I just checked ${result.details?.domain?.name || url} on TrustworthyCheck - ${result.verdict === 'safe' ? '✅ Safe' : result.verdict === 'caution' ? '⚠️ Use Caution' : '🚨 High Risk'} (Trust Score: ${result.trustScore}/100). Check any website before you buy:`
                  )}&url=${encodeURIComponent(window.location.origin)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#1DA1F2]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#1DA1F2]/20 transition-colors">
                    <svg className="w-5 h-5 text-[#1DA1F2]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-sm">Share on X</p>
                    <p className="text-xs text-muted-foreground">Post to Twitter/X</p>
                  </div>
                </a>
              </Button>

              {/* Share on Facebook */}
              <Button
                variant="outline"
                className="h-auto py-3 px-4 flex items-center gap-3 justify-start bg-card hover:bg-[#1877F2]/5 hover:border-[#1877F2]/40 group"
                asChild
              >
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin)}&quote=${encodeURIComponent(
                    `I just checked ${result.details?.domain?.name || url} on TrustworthyCheck - ${result.verdict === 'safe' ? '✅ Safe' : result.verdict === 'caution' ? '⚠️ Use Caution' : '🚨 High Risk'} (Trust Score: ${result.trustScore}/100)`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#1877F2]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#1877F2]/20 transition-colors">
                    <svg className="w-5 h-5 text-[#1877F2]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-sm">Share on Facebook</p>
                    <p className="text-xs text-muted-foreground">Post to Facebook</p>
                  </div>
                </a>
              </Button>

              {/* Share on WhatsApp */}
              <Button
                variant="outline"
                className="h-auto py-3 px-4 flex items-center gap-3 justify-start bg-card hover:bg-[#25D366]/5 hover:border-[#25D366]/40 group"
                asChild
              >
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `I just checked ${result.details?.domain?.name || url} on TrustworthyCheck - ${result.verdict === 'safe' ? '✅ Safe' : result.verdict === 'caution' ? '⚠️ Use Caution' : '🚨 High Risk'} (Trust Score: ${result.trustScore}/100). Check any website before you buy: ${window.location.origin}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#25D366]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#25D366]/20 transition-colors">
                    <svg className="w-5 h-5 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-sm">Share on WhatsApp</p>
                    <p className="text-xs text-muted-foreground">Send to contacts</p>
                  </div>
                </a>
              </Button>

              {/* Share on TikTok - copies text since no direct share API */}
              <Button
                variant="outline"
                className="h-auto py-3 px-4 flex items-center gap-3 justify-start bg-card hover:bg-[#000000]/5 hover:border-[#000000]/40 group"
                onClick={() => {
                  const shareText = `I just checked ${result.details?.domain?.name || url} on TrustworthyCheck - ${result.verdict === 'safe' ? '✅ Safe' : result.verdict === 'caution' ? '⚠️ Use Caution' : '🚨 High Risk'} (Trust Score: ${result.trustScore}/100). Check any website before you buy: ${window.location.origin}`;
                  navigator.clipboard.writeText(shareText);
                  toast({
                    title: 'Copied for TikTok!',
                    description: 'Paste in your TikTok caption or comment',
                  });
                }}
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00f2ea]/20 to-[#ff0050]/20 flex items-center justify-center flex-shrink-0 group-hover:from-[#00f2ea]/30 group-hover:to-[#ff0050]/30 transition-colors">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-medium text-sm">Share on TikTok</p>
                  <p className="text-xs text-muted-foreground">Copy for TikTok</p>
                </div>
              </Button>

              {/* Share on Instagram - copies text since no direct share API */}
              <Button
                variant="outline"
                className="h-auto py-3 px-4 flex items-center gap-3 justify-start bg-card hover:bg-[#E4405F]/5 hover:border-[#E4405F]/40 group"
                onClick={() => {
                  const shareText = `I just checked ${result.details?.domain?.name || url} on TrustworthyCheck - ${result.verdict === 'safe' ? '✅ Safe' : result.verdict === 'caution' ? '⚠️ Use Caution' : '🚨 High Risk'} (Trust Score: ${result.trustScore}/100). Check any website before you buy: ${window.location.origin}`;
                  navigator.clipboard.writeText(shareText);
                  toast({
                    title: 'Copied for Instagram!',
                    description: 'Paste in your Instagram story or post',
                  });
                }}
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#833AB4]/20 via-[#E4405F]/20 to-[#FCAF45]/20 flex items-center justify-center flex-shrink-0 group-hover:from-[#833AB4]/30 group-hover:via-[#E4405F]/30 group-hover:to-[#FCAF45]/30 transition-colors">
                  <svg className="w-5 h-5 text-[#E4405F]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-medium text-sm">Share on Instagram</p>
                  <p className="text-xs text-muted-foreground">Copy for Instagram</p>
                </div>
              </Button>
            </motion.div>

            {/* Actions */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Button variant="outline" size="lg" onClick={handleNewCheck}>
                Check Another URL
              </Button>
              <Button 
                variant="secondary" 
                size="lg" 
                onClick={() => setShowDetails(!showDetails)}
              >
                {showDetails ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    Hide Details
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    View Details
                  </>
                )}
              </Button>

              <Button variant="glass" size="lg" asChild>
                <a href={url.startsWith('http') ? url : `https://${url}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4" />
                  Visit Website
                </a>
              </Button>
            </motion.div>

            {/* Expandable Details Section */}
            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-6 pt-2">
                    {/* Analysis Summary Card */}
                    <div className="glass-card rounded-2xl overflow-hidden p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          result.verdict === 'safe' 
                            ? 'bg-success/10' 
                            : result.verdict === 'caution' 
                            ? 'bg-warning/10' 
                            : 'bg-danger/10'
                        }`}>
                          {result.verdict === 'safe' ? (
                            <CheckCircle className={`w-5 h-5 text-success`} />
                          ) : (
                            <AlertTriangle className={`w-5 h-5 ${result.verdict === 'caution' ? 'text-warning' : 'text-danger'}`} />
                          )}
                        </div>
                        <div>
                          <h3 className="font-display text-lg font-semibold">Analysis Summary</h3>
                          <p className="text-xs text-muted-foreground">Based on automated security checks</p>
                        </div>
                      </div>
                      <p className="text-foreground/90 leading-relaxed">{result.summary}</p>
                    </div>

                    {/* Unlock Full Report CTA */}
                    <DetailedReportUpsell 
                      url={url}
                      trustScore={result.trustScore}
                      analysisResult={result}
                    />

                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Report Site Dialog */}
      <ReportSiteDialog
        open={showReportDialog}
        onOpenChange={setShowReportDialog}
        url={url}
        trustScore={result?.trustScore}
        verdict={result?.verdict}
      />
    </div>
  );
}
