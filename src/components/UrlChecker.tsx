import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Shield, Globe, Building2, AlertTriangle, CheckCircle, DollarSign, Users, ExternalLink, Clock, Image, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TrustScoreGauge } from './TrustScoreGauge';
import { AnalysisCard } from './AnalysisCard';
import { CheckItem } from './CheckItem';
import { FlagsList } from './FlagsList';
import { ScanningAnimation } from './ScanningAnimation';
import { analyzeUrl, type AnalysisResult } from '@/lib/api/url-check';
import { useToast } from '@/hooks/use-toast';
import { useUrlHistory } from '@/hooks/use-url-history';

export function UrlChecker() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [scanStage, setScanStage] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const { addToHistory } = useUrlHistory();
  const { toast } = useToast();

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

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Search Form */}
      <motion.form
        onSubmit={handleSubmit}
        className="mb-4"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Globe className="w-5 h-5" />
          </div>
          <Input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter website URL to check (e.g., example-shop.com)"
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
                  Scanning
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Check URL
                </>
              )}
            </Button>
          </div>
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
            className="space-y-6"
          >
            {/* Trust Score Header */}
            <div className="glass-card rounded-2xl p-8 text-center">
              <div className="flex flex-col items-center gap-4">
                <TrustScoreGauge 
                  score={result.trustScore} 
                  verdict={result.verdict} 
                  redFlagsCount={result.details.redFlags?.length || 0}
                />
                <div className="text-center max-w-2xl">
                  <h2 className="font-display text-xl font-bold mb-2">
                    {result.scrapedData?.title || result.details.domain.name}
                  </h2>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Globe className="w-4 h-4" />
                    <span>{result.details.domain.name}</span>
                    {result.details.domain.ssl && (
                      <span className="flex items-center gap-1 text-success">
                        <Shield className="w-3 h-3" />
                        SSL
                      </span>
                    )}
                  </div>
                </div>
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
                    {/* Summary */}
                    <div className="glass-card rounded-2xl p-6">
                      <h3 className="font-display text-lg font-semibold mb-3">Analysis Summary</h3>
                      <p className="text-muted-foreground">{result.summary}</p>
                    </div>

                    {/* Screenshot */}
                    {result.scrapedData?.screenshot && (
                      <div className="glass-card rounded-2xl p-6">
                        <h3 className="font-display text-lg font-semibold mb-4">Website Screenshot</h3>
                        <img
                          src={`data:image/png;base64,${result.scrapedData.screenshot}`}
                          alt="Website screenshot"
                          className="rounded-lg border border-border w-full max-w-2xl mx-auto"
                        />
                      </div>
                    )}

                    {/* Analysis Grid */}
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
                            <span className="text-sm text-muted-foreground">SSL Certificate</span>
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
                            <span className="text-sm text-muted-foreground">Domain Age</span>
                            <span className="text-sm">{result.details.domain.age}</span>
                          </div>
                        </div>
                      </AnalysisCard>

                      {/* Dropshipper Detection */}
                      <AnalysisCard
                        title="Dropshipper Detection"
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
                                ? `Likely dropshipper (${result.details.dropshipperIndicators.confidence} confidence)`
                                : 'No dropshipper indicators found'}
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

                    {/* Red Flags & Positive Signals */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <AnalysisCard
                        title="Red Flags"
                        icon={AlertTriangle}
                        status={result.details.redFlags.length > 0 ? 'danger' : 'success'}
                        delay={0.5}
                      >
                        <FlagsList items={result.details.redFlags} type="red" />
                      </AnalysisCard>

                      <AnalysisCard
                        title="Positive Signals"
                        icon={CheckCircle}
                        status={result.details.positiveSignals.length > 0 ? 'success' : 'neutral'}
                        delay={0.6}
                      >
                        <FlagsList items={result.details.positiveSignals} type="green" />
                      </AnalysisCard>
                    </div>
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
