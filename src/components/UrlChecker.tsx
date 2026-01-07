import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Shield, Globe, Building2, AlertTriangle, CheckCircle, DollarSign, Users, ExternalLink, Clock, Image, ChevronDown, ChevronUp, Lock, FileText, Sparkles, Infinity as InfinityIcon } from 'lucide-react';
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

export function UrlChecker() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [scanStage, setScanStage] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const { addToHistory } = useUrlHistory();
  const { toast } = useToast();
  const { isLimitReached, useCheck, resetForDemo, checksRemaining } = useDailyChecks();

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isLoading) {
      interval = setInterval(() => {
        setScanStage(prev => (prev < 3 ? prev + 1 : prev));
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    // Check daily limit before proceeding
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
          <p className="text-xs text-muted-foreground">
            <span className={`font-medium ${checksRemaining > 0 ? 'text-primary' : 'text-amber-500'}`}>
              {checksRemaining} free check{checksRemaining !== 1 ? 's' : ''} remaining today
            </span> • Upgrade for unlimited
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
                      
                      {/* Monetization teaser */}
                      <div className="mt-4 p-3 rounded-lg bg-muted/50 border border-border/50">
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">Want deeper analysis?</span> Full reports include WHOIS history, reputation database checks, and comparative market analysis.
                          <span className="text-primary font-medium ml-1">Coming soon</span>
                        </p>
                      </div>
                    </div>


                    {/* Automated Checks Section Header */}
                    <div className="flex items-center gap-3 pt-2">
                      <div className="h-px flex-1 bg-border" />
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-3 py-1 bg-muted rounded-full">
                        ✓ Automated Checks
                      </span>
                      <div className="h-px flex-1 bg-border" />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Business Legitimacy */}
                      <AnalysisCard
                        title="Business Legitimacy"
                        icon={Building2}
                        status={
                          (result.details.business.hasPhysicalAddress && result.details.business.addressVerification === 'verified') ? 'success' :
                          result.details.business.hasContactInfo ? 'warning' :
                          'danger'
                        }
                        delay={0.1}
                      >
                        <div className="space-y-1">
                          <CheckItem 
                            label="Contact information" 
                            status={result.details.business.hasContactInfo ? 'pass' : 'fail'} 
                          />
                          <CheckItem 
                            label="Physical address" 
                            status={result.details.business.hasPhysicalAddress ? 'pass' : 'fail'} 
                          />
                          <CheckItem 
                            label="Address verification" 
                            status={
                              result.details.business.addressVerification === 'verified' ? 'pass' :
                              result.details.business.addressVerification === 'suspicious' ? 'fail' :
                              result.details.business.addressVerification === 'po_box' ? 'warning' :
                              'fail'
                            } 
                          />
                          <CheckItem 
                            label="About page" 
                            status={result.details.business.hasAboutPage ? 'pass' : 'fail'} 
                          />
                          <CheckItem 
                            label="Privacy policy" 
                            status={result.details.business.hasPrivacyPolicy ? 'pass' : 'fail'} 
                          />
                          <CheckItem 
                            label="Return/Refund policy" 
                            status={result.details.business.hasReturnPolicy ? 'pass' : 'fail'} 
                          />
                          <CheckItem 
                            label="Shipping information" 
                            status={result.details.business.hasShippingInfo ? 'pass' : 'fail'} 
                          />
                          {result.details.business.businessAge && (
                            <div className="flex items-center gap-2 pt-2 text-sm text-muted-foreground">
                              <Clock className="w-4 h-4" />
                              <span>Business age: {result.details.business.businessAge}</span>
                            </div>
                          )}
                        </div>
                      </AnalysisCard>

                      {/* Domain Info */}
                      <AnalysisCard
                        title="Domain Security"
                        icon={Shield}
                        status={result.details.domain.ssl ? 'success' : 'danger'}
                        delay={0.2}
                      >
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Domain</span>
                            <span className="text-sm font-medium">{result.details.domain.name}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm text-muted-foreground">SSL Certificate</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">✓ Live</span>
                            </div>
                            <span className={`text-sm font-medium ${result.details.domain.ssl ? 'text-status-safe' : 'text-status-danger'}`}>
                              {result.details.domain.ssl ? 'Secure' : 'Not Secure'}
                            </span>
                          </div>
                          {result.details.domain.sslIssuer && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Issuer</span>
                              <span className="text-sm">{result.details.domain.sslIssuer}</span>
                            </div>
                          )}
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm text-muted-foreground">Domain Age</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600">Estimated</span>
                            </div>
                            <span className="text-sm">{result.details.domain.age}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm text-muted-foreground">WHOIS Data</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">Coming Soon</span>
                            </div>
                            <span className="text-sm text-muted-foreground">—</span>
                          </div>
                        </div>
                      </AnalysisCard>

                      {/* Reseller/Fulfillment Analysis */}
                      <AnalysisCard
                        title="Fulfillment Model"
                        icon={AlertTriangle}
                        status={
                          result.details.dropshipperIndicators?.isLikelyDropshipper 
                            ? (result.details.dropshipperIndicators.confidence === 'high' ? 'danger' : 'warning')
                            : 'success'
                        }
                        delay={0.25}
                      >
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            {result.details.dropshipperIndicators?.isLikelyDropshipper ? (
                              <AlertTriangle className="w-4 h-4 text-status-warning" />
                            ) : (
                              <CheckCircle className="w-4 h-4 text-status-safe" />
                            )}
                            <span className={`text-sm font-medium ${result.details.dropshipperIndicators?.isLikelyDropshipper ? 'text-status-warning' : 'text-foreground'}`}>
                              {result.details.dropshipperIndicators?.isLikelyDropshipper 
                                ? `Reseller indicators found (${result.details.dropshipperIndicators.confidence} confidence)`
                                : 'No reseller indicators found'}
                            </span>
                          </div>
                          {result.details.dropshipperIndicators?.reasons && result.details.dropshipperIndicators.reasons.length > 0 && (
                            <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
                              {result.details.dropshipperIndicators.reasons.map((reason, i) => (
                                <li key={i}>{reason}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </AnalysisCard>

                      {/* Image Analysis */}
                      <AnalysisCard
                        title="Image Analysis"
                        icon={Image}
                        status={
                          result.details.imageAnalysis?.appearsOriginal ? 'success' :
                          result.details.imageAnalysis?.stockPhotoLikely ? 'warning' :
                          'neutral'
                        }
                        delay={0.3}
                      >
                        <div className="space-y-2">
                          <CheckItem 
                            label="Original product images" 
                            status={result.details.imageAnalysis?.appearsOriginal ? 'pass' : 'warning'} 
                          />
                          <CheckItem 
                            label="Stock photos detected" 
                            status={result.details.imageAnalysis?.stockPhotoLikely ? 'fail' : 'pass'} 
                          />
                          <div className="flex justify-between items-center pt-1">
                            <span className="text-sm text-muted-foreground">Image quality</span>
                            <span className={`text-sm font-medium ${
                              result.details.imageAnalysis?.qualityAssessment === 'professional' ? 'text-status-safe' :
                              result.details.imageAnalysis?.qualityAssessment === 'suspicious' ? 'text-status-danger' :
                              'text-muted-foreground'
                            }`}>
                              {result.details.imageAnalysis?.qualityAssessment || 'Unknown'}
                            </span>
                          </div>
                        </div>
                      </AnalysisCard>

                      {/* Pricing Analysis */}
                      <AnalysisCard
                        title="Pricing Analysis"
                        icon={DollarSign}
                        status={result.details.pricing.suspiciouslyLow ? 'warning' : 'neutral'}
                        delay={0.35}
                      >
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            {result.details.pricing.suspiciouslyLow ? (
                              <AlertTriangle className="w-4 h-4 text-status-warning" />
                            ) : (
                              <CheckCircle className="w-4 h-4 text-status-safe" />
                            )}
                            <span className={`text-sm ${result.details.pricing.suspiciouslyLow ? 'text-status-warning' : 'text-foreground'}`}>
                              {result.details.pricing.suspiciouslyLow ? 'Prices may be too good to be true' : 'Pricing appears reasonable'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Compared to market</span>
                            <span className={`text-sm font-medium ${
                              result.details.pricing.comparisonToMarket === 'much_lower' ? 'text-status-danger' :
                              result.details.pricing.comparisonToMarket === 'slightly_lower' ? 'text-status-warning' :
                              'text-foreground'
                            }`}>
                              {result.details.pricing.comparisonToMarket?.replace('_', ' ') || 'Normal'}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{result.details.pricing.notes}</p>
                        </div>
                      </AnalysisCard>

                      {/* Social Proof */}
                      <AnalysisCard
                        title="Social Proof"
                        icon={Users}
                        status={
                          result.details.socialProof.hasReviews && result.details.socialProof.reviewsAppearAuthentic ? 'success' :
                          result.details.socialProof.hasReviews || result.details.socialProof.hasSocialLinks ? 'warning' :
                          'danger'
                        }
                        delay={0.4}
                      >
                        <div className="space-y-1">
                          <CheckItem 
                            label="Customer reviews visible" 
                            status={result.details.socialProof.hasReviews ? 'pass' : 'fail'} 
                          />
                          <CheckItem 
                            label="Reviews appear authentic" 
                            status={result.details.socialProof.reviewsAppearAuthentic ? 'pass' : 'warning'} 
                          />
                          <CheckItem 
                            label="Social media presence" 
                            status={result.details.socialProof.hasSocialLinks ? 'pass' : 'fail'} 
                          />
                          <CheckItem 
                            label="External review platforms" 
                            status={result.details.socialProof.externalReviewPlatforms ? 'pass' : 'warning'} 
                          />
                          <p className="text-sm text-muted-foreground mt-2">{result.details.socialProof.notes}</p>
                        </div>
                      </AnalysisCard>

                      {/* Website Quality */}
                      <AnalysisCard
                        title="Website Quality"
                        icon={Globe}
                        status={
                          result.details.websiteQuality?.overallProfessionalism === 'high' ? 'success' :
                          result.details.websiteQuality?.overallProfessionalism === 'medium' ? 'warning' :
                          'danger'
                        }
                        delay={0.45}
                      >
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Design quality</span>
                            <span className={`text-sm font-medium ${
                              result.details.websiteQuality?.designQuality === 'professional' ? 'text-status-safe' :
                              result.details.websiteQuality?.designQuality === 'poor' ? 'text-status-danger' :
                              'text-muted-foreground'
                            }`}>
                              {result.details.websiteQuality?.designQuality || 'Unknown'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Grammar quality</span>
                            <span className={`text-sm font-medium ${
                              result.details.websiteQuality?.grammarQuality === 'excellent' || result.details.websiteQuality?.grammarQuality === 'good' ? 'text-status-safe' :
                              result.details.websiteQuality?.grammarQuality === 'poor' ? 'text-status-danger' :
                              'text-muted-foreground'
                            }`}>
                              {result.details.websiteQuality?.grammarQuality || 'Unknown'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Overall professionalism</span>
                            <span className={`text-sm font-medium ${
                              result.details.websiteQuality?.overallProfessionalism === 'high' ? 'text-status-safe' :
                              result.details.websiteQuality?.overallProfessionalism === 'low' ? 'text-status-danger' :
                              'text-muted-foreground'
                            }`}>
                              {result.details.websiteQuality?.overallProfessionalism || 'Unknown'}
                            </span>
                          </div>
                        </div>
                      </AnalysisCard>
                    </div>

                    {/* Summary Findings Section Header */}
                    <div className="flex items-center gap-3 pt-2">
                      <div className="h-px flex-1 bg-border" />
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-3 py-1 bg-muted rounded-full">
                        Summary Findings
                      </span>
                      <div className="h-px flex-1 bg-border" />
                    </div>

                    {/* Concerns & Positive Signals */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <AnalysisCard
                        title="Concerns Found"
                        icon={AlertTriangle}
                        status={result.details.redFlags.length > 0 ? 'danger' : 'success'}
                        delay={0.5}
                      >
                        <FlagsList items={result.details.redFlags} type="red" />
                        {result.details.redFlags.length === 0 && (
                          <p className="text-sm text-muted-foreground">No significant concerns identified</p>
                        )}
                      </AnalysisCard>

                      <AnalysisCard
                        title="Positive Indicators"
                        icon={CheckCircle}
                        status={result.details.positiveSignals.length > 0 ? 'success' : 'neutral'}
                        delay={0.6}
                      >
                        <FlagsList items={result.details.positiveSignals} type="green" />
                        {result.details.positiveSignals.length === 0 && (
                          <p className="text-sm text-muted-foreground">Limited positive indicators found</p>
                        )}
                      </AnalysisCard>
                    </div>

                    {/* Pro Features Teaser */}
                    <motion.div
                      className="rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 p-6"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="w-5 h-5 text-primary" />
                        <h3 className="font-display font-semibold text-primary">Unlock Pro Features</h3>
                      </div>
                      <div className="grid sm:grid-cols-3 gap-3">
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-background/60 border border-border/50 opacity-75">
                          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                            <FileText className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-muted-foreground">Downloadable Report</p>
                            <span className="text-[10px] text-primary font-medium flex items-center gap-1">
                              <Lock className="w-3 h-3" /> Pro
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-background/60 border border-border/50 opacity-75">
                          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                            <Search className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-muted-foreground">Full Reasoning</p>
                            <span className="text-[10px] text-primary font-medium flex items-center gap-1">
                              <Lock className="w-3 h-3" /> Pro
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-background/60 border border-border/50 opacity-75">
                          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                            <InfinityIcon className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-muted-foreground">Unlimited Checks</p>
                            <span className="text-[10px] text-primary font-medium flex items-center gap-1">
                              <Lock className="w-3 h-3" /> Pro
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 text-center">
                        <Button variant="default" size="sm" className="gap-2">
                          <Sparkles className="w-4 h-4" />
                          Upgrade to Pro
                        </Button>
                        <p className="text-xs text-muted-foreground mt-2">Coming soon</p>
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
