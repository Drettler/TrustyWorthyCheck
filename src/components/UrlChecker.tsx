import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Shield, Globe, Building2, AlertTriangle, CheckCircle, DollarSign, Users, ExternalLink, Clock, Image, ChevronDown, ChevronUp, Lock, FileText, Sparkles, Infinity as InfinityIcon, ShieldCheck, Calendar, TrendingDown, Heart, X, ShieldAlert, Eye, CreditCard, ShieldPlus, Store, Flag, Coins } from 'lucide-react';
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
      // Clear the URL parameter
      setSearchParams({}, { replace: true });
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
      />
    </div>
  );
}
