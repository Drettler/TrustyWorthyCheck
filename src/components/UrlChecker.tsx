import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Shield, Globe, Building2, AlertTriangle, CheckCircle, DollarSign, Users, ExternalLink, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TrustScoreGauge } from './TrustScoreGauge';
import { AnalysisCard } from './AnalysisCard';
import { CheckItem } from './CheckItem';
import { FlagsList } from './FlagsList';
import { ScanningAnimation } from './ScanningAnimation';
import { HistoryPanel } from './HistoryPanel';
import { analyzeUrl, type AnalysisResult } from '@/lib/api/url-check';
import { useToast } from '@/hooks/use-toast';
import { useUrlHistory, type HistoryEntry } from '@/hooks/use-url-history';

export function UrlChecker() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [scanStage, setScanStage] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const { history, addToHistory, removeFromHistory, clearHistory } = useUrlHistory();
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
  };

  const handleHistorySelect = (entry: HistoryEntry) => {
    setUrl(entry.url);
    setResult(entry.result);
    setShowHistory(false);
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

      {/* History Toggle */}
      {!isLoading && !result && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowHistory(!showHistory)}
            className="text-muted-foreground hover:text-foreground"
          >
            <History className="w-4 h-4 mr-2" />
            {showHistory ? 'Hide History' : `View History (${history.length})`}
          </Button>

          <AnimatePresence>
            {showHistory && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 overflow-hidden"
              >
                <HistoryPanel
                  history={history}
                  onSelect={handleHistorySelect}
                  onRemove={removeFromHistory}
                  onClear={clearHistory}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

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
              <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                <div className="flex-1">
                  <TrustScoreGauge score={result.trustScore} verdict={result.verdict} />
                </div>
                <div className="flex-1 text-left">
                  <h2 className="font-display text-2xl font-bold mb-3">
                    {result.scrapedData?.title || result.details.domain.name}
                  </h2>
                  <p className="text-muted-foreground mb-4">{result.summary}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Globe className="w-4 h-4" />
                    <span>{result.details.domain.name}</span>
                    {result.details.domain.ssl && (
                      <span className="flex items-center gap-1 text-success">
                        <Shield className="w-3 h-3" />
                        SSL
                      </span>
                    )}
                  </div>
                  {result.scrapedData?.screenshot && (
                    <div className="mt-4">
                      <img
                        src={`data:image/png;base64,${result.scrapedData.screenshot}`}
                        alt="Website screenshot"
                        className="rounded-lg border border-border w-full max-w-md"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Analysis Grid */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Business Legitimacy */}
              <AnalysisCard
                title="Business Legitimacy"
                icon={Building2}
                status={
                  Object.values(result.details.business).filter(Boolean).length >= 4 ? 'success' :
                  Object.values(result.details.business).filter(Boolean).length >= 2 ? 'warning' :
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
                    label="About page" 
                    status={result.details.business.hasAboutPage ? 'pass' : 'fail'} 
                  />
                  <CheckItem 
                    label="Privacy policy" 
                    status={result.details.business.hasPrivacyPolicy ? 'pass' : 'fail'} 
                  />
                  <CheckItem 
                    label="Terms of service" 
                    status={result.details.business.hasTerms ? 'pass' : 'fail'} 
                  />
                  <CheckItem 
                    label="Return/Refund policy" 
                    status={result.details.business.hasReturnPolicy ? 'pass' : 'fail'} 
                  />
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
                    <span className={`text-sm font-medium ${result.details.domain.ssl ? 'text-success' : 'text-danger'}`}>
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

              {/* Pricing Analysis */}
              <AnalysisCard
                title="Pricing Analysis"
                icon={DollarSign}
                status={result.details.pricing.suspiciouslyLow ? 'warning' : 'neutral'}
                delay={0.3}
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {result.details.pricing.suspiciouslyLow ? (
                      <AlertTriangle className="w-4 h-4 text-warning" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-success" />
                    )}
                    <span className={`text-sm ${result.details.pricing.suspiciouslyLow ? 'text-warning' : 'text-foreground'}`}>
                      {result.details.pricing.suspiciouslyLow ? 'Prices may be too good to be true' : 'Pricing appears reasonable'}
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
                  result.details.socialProof.hasReviews && result.details.socialProof.hasSocialLinks ? 'success' :
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
                    label="Social media presence" 
                    status={result.details.socialProof.hasSocialLinks ? 'pass' : 'fail'} 
                  />
                  <p className="text-sm text-muted-foreground mt-2">{result.details.socialProof.notes}</p>
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

            {/* Actions */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <Button variant="outline" size="lg" onClick={handleNewCheck}>
                Check Another URL
              </Button>
              <Button variant="glass" size="lg" asChild>
                <a href={url.startsWith('http') ? url : `https://${url}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4" />
                  Visit Website
                </a>
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
