import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Shield, Globe, Building2, AlertTriangle, CheckCircle, DollarSign, Users, ExternalLink, Clock, Image, ChevronDown, ChevronUp, Lock, FileText, Sparkles, Infinity as InfinityIcon, ShieldCheck, Calendar, TrendingDown, Heart, X, ShieldAlert, Eye, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TrustScoreGauge } from './TrustScoreGauge';
import { AnalysisCard } from './AnalysisCard';
import { CheckItem } from './CheckItem';
import { FlagsList } from './FlagsList';
import { ScanningAnimation } from './ScanningAnimation';
import { UpgradePrompt } from './UpgradePrompt';
import { analyzeUrl, type AnalysisResult } from '@/lib/api/url-check';
import { useToast } from '@/hooks/use-toast';
import { useUrlHistory } from '@/hooks/use-url-history';
import { useDailyChecks } from '@/hooks/use-daily-checks';
import { supabase } from '@/integrations/supabase/client';

export function UrlChecker() {
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
  const { isLimitReached, useCheck, resetForDemo, checksRemaining } = useDailyChecks();

  const handleUnlockFullReport = async () => {
    setIsPaymentLoading(true);
    try {
      // Store the current analysis result before redirecting to payment
      if (result) {
        sessionStorage.setItem('pendingAnalysisResult', JSON.stringify(result));
        sessionStorage.setItem('pendingAnalysisUrl', url);
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

    // Check daily limit
    if (!useCheck()) {
      return;
    }

    setIsLoading(true);
    setScanStage(0);
    setResult(null);

    try {
      const analysisResult = await analyzeUrl(url);
      setResult(analysisResult);
      addToHistory(url, analysisResult);
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: 'Analysis Failed',
        description: error instanceof Error ? error.message : 'Could not analyze this URL. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setScanStage(0);
    }
  };

  const handleNewCheck = () => {
    setResult(null);
    setUrl('');
    setShowDetails(false);
  };

  // Show upgrade prompt if limit reached and no result displayed
  if (isLimitReached && !result) {
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

      {/* Search Form */}
      <motion.form
        onSubmit={handleSubmit}
        className="mb-4 space-y-3"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {/* URL Input - Required */}
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Globe className="w-5 h-5" />
          </div>
          <Input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter website URL (e.g., example-shop.com)"
            className="pl-12 pr-32 h-14 text-lg bg-card border-border focus:border-primary rounded-xl"
            disabled={isLoading}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <Button
              type="submit"
              variant="hero"
              size="lg"
              disabled={isLoading || !url.trim()}
              className="rounded-lg"
            >
              {isLoading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Shield className="w-5 h-5" />
                  </motion.div>
                  Analyzing
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Analyze
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Optional Fields */}
        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Business name (optional)"
              className="h-10 text-sm bg-card border-border focus:border-primary rounded-lg"
              disabled={isLoading}
            />
          </div>
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Country (optional)"
              className="h-10 text-sm bg-card border-border focus:border-primary rounded-lg"
              disabled={isLoading}
            />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Optional fields help provide context but are not required for analysis
          </p>
        </div>
      </motion.form>


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
            {/* Warning Banner for Danger/Caution */}
            {(result.verdict === 'danger' || result.verdict === 'caution') && (
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
                />
              </div>
            </div>

            {/* Extra Protection Section */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl border border-border/60 bg-gradient-to-br from-primary/5 via-background to-primary/5 p-6 text-center"
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <ShieldAlert className="w-5 h-5 text-primary" />
                <h3 className="font-display text-lg font-semibold">Extra Protection</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                If a website feels risky, protect your identity before continuing.
              </p>
              <Button
                variant="default"
                size="lg"
                className="gap-2"
                asChild
              >
                <a href="https://www.aura.com/lp/identity-theft-protection" target="_blank" rel="noopener noreferrer">
                  <ShieldCheck className="w-4 h-4" />
                  Protect My Identity
                </a>
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
                    {/* Summary - Free Preview */}
                    <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
                      <div className="absolute top-3 right-3">
                        <span className="text-[10px] px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                          Free Preview
                        </span>
                      </div>
                      <h3 className="font-display text-lg font-semibold mb-3">Analysis Summary</h3>
                      <p className="text-muted-foreground">{result.summary}</p>
                      <p className="text-xs text-muted-foreground/70 mt-4 border-t border-border pt-3">
                        This assessment is based on automated checks and publicly available information. We recommend reviewing the details below and conducting your own verification before making purchases.
                      </p>
                      
                      {/* Pro Features Preview - Show actual data */}
                      {result.proFeatures && (
                        <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20">
                          <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="w-4 h-4 text-primary" />
                            <span className="text-sm font-semibold text-primary">Pro Analysis Preview</span>
                          </div>
                          <div className="grid gap-3 sm:grid-cols-3">
                            {/* VirusTotal Preview */}
                            <div className="p-3 rounded-lg bg-background/60 border border-border/50">
                              <div className="flex items-center gap-2 mb-2">
                                <ShieldCheck className="w-4 h-4 text-muted-foreground" />
                                <span className="text-xs font-medium">Security Scan</span>
                              </div>
                              {result.proFeatures.virusTotal.available ? (
                                <div className={`text-sm font-semibold ${result.proFeatures.virusTotal.isMalicious ? 'text-danger' : 'text-success'}`}>
                                  {result.proFeatures.virusTotal.isMalicious 
                                    ? `⚠️ ${result.proFeatures.virusTotal.maliciousCount} threats detected`
                                    : '✓ No threats detected'}
                                </div>
                              ) : (
                                <div className="text-xs text-muted-foreground">Scan complete</div>
                              )}
                              <p className="text-[10px] text-muted-foreground mt-1">
                                {result.proFeatures.virusTotal.totalEngines} security engines checked
                              </p>
                            </div>
                            
                            {/* WHOIS Preview */}
                            <div className="p-3 rounded-lg bg-background/60 border border-border/50">
                              <div className="flex items-center gap-2 mb-2">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <span className="text-xs font-medium">Domain Age</span>
                              </div>
                              {result.proFeatures.whois.available ? (
                                <>
                                  <div className={`text-sm font-semibold ${
                                    result.proFeatures.whois.domainAgeInDays && result.proFeatures.whois.domainAgeInDays < 90 
                                      ? 'text-danger' 
                                      : result.proFeatures.whois.domainAgeInDays && result.proFeatures.whois.domainAgeInDays < 365
                                      ? 'text-warning'
                                      : 'text-foreground'
                                  }`}>
                                    {result.proFeatures.whois.domainAge || 'Unknown'}
                                  </div>
                                  <p className="text-[10px] text-muted-foreground mt-1">
                                    {result.proFeatures.whois.registrar ? `via ${result.proFeatures.whois.registrar}` : 'Registrar info available'}
                                  </p>
                                </>
                              ) : (
                                <div className="text-xs text-muted-foreground">WHOIS data available</div>
                              )}
                            </div>
                            
                            {/* Price Comparison Preview */}
                            <div className="p-3 rounded-lg bg-background/60 border border-border/50">
                              <div className="flex items-center gap-2 mb-2">
                                <TrendingDown className="w-4 h-4 text-muted-foreground" />
                                <span className="text-xs font-medium">Price Analysis</span>
                              </div>
                              {result.proFeatures.priceComparison.productsAnalyzed > 0 ? (
                                <>
                                  <div className={`text-sm font-semibold ${
                                    result.proFeatures.priceComparison.averageDiscount >= 60 
                                      ? 'text-danger' 
                                      : result.proFeatures.priceComparison.averageDiscount >= 40
                                      ? 'text-warning'
                                      : 'text-foreground'
                                  }`}>
                                    {result.proFeatures.priceComparison.averageDiscount}% avg discount
                                  </div>
                                  <p className="text-[10px] text-muted-foreground mt-1">
                                    {result.proFeatures.priceComparison.productsAnalyzed} prices analyzed
                                  </p>
                                </>
                              ) : (
                                <div className="text-xs text-muted-foreground">No pricing detected</div>
                              )}
                            </div>
                          </div>
                          <p className="text-[10px] text-center text-muted-foreground mt-3">
                            Unlock Pro for full WHOIS history, detailed security reports & market comparison
                          </p>
                        </div>
                      )}
                    </div>


                    {/* Concerns Found - Free */}
                    <AnalysisCard
                      title="Concerns Found"
                      icon={AlertTriangle}
                      status={result.details.redFlags.length > 0 ? 'danger' : 'success'}
                      delay={0.1}
                    >
                      <FlagsList items={result.details.redFlags} type="red" />
                      {result.details.redFlags.length === 0 && (
                        <p className="text-sm text-muted-foreground">No significant concerns identified</p>
                      )}
                    </AnalysisCard>

                    {/* Locked Pro Features */}
                    <motion.div
                      className="rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 p-6"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Lock className="w-5 h-5 text-primary" />
                          <h3 className="font-display font-semibold text-primary">Full Analysis Available with Pro</h3>
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary font-medium">
                          8 detailed reports
                        </span>
                      </div>
                      
                      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
                        {[
                          { icon: Building2, label: "Business Legitimacy" },
                          { icon: Shield, label: "Domain Security" },
                          { icon: AlertTriangle, label: "Fulfillment Model" },
                          { icon: Image, label: "Image Analysis" },
                          { icon: DollarSign, label: "Pricing Analysis" },
                          { icon: Users, label: "Social Proof" },
                          { icon: Globe, label: "Website Quality" },
                          { icon: CheckCircle, label: "Positive Indicators" },
                        ].map((item, index) => (
                          <div 
                            key={item.label}
                            className="flex items-center gap-2 p-3 rounded-xl bg-background/60 border border-border/50 opacity-60"
                          >
                            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                              <item.icon className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-muted-foreground truncate">{item.label}</p>
                              <span className="text-[10px] text-primary/70 flex items-center gap-0.5">
                                <Lock className="w-2.5 h-2.5" /> Pro
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="text-center pt-2 border-t border-primary/20">
                        <Button 
                          variant="default" 
                          size="lg" 
                          className="gap-2 mt-4"
                          onClick={handleUnlockFullReport}
                          disabled={isPaymentLoading}
                        >
                          {isPaymentLoading ? (
                            <>
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                              >
                                <Sparkles className="w-4 h-4" />
                              </motion.div>
                              Processing...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4" />
                              Unlock Full Report - $4.99
                            </>
                          )}
                        </Button>
                        <p className="text-xs text-muted-foreground mt-2">One-time payment • Detailed analysis & downloadable report</p>
                      </div>
                    </motion.div>


                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
