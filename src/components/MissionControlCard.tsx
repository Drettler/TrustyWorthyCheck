import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Globe, Building2, MapPin, Shield, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TrustScoreGauge } from './TrustScoreGauge';
import { ScanningAnimation } from './ScanningAnimation';
import { UpgradePrompt } from './UpgradePrompt';
import { ScamWarningBanner } from './ScamWarningBanner';
import { FullReportDisplay } from './FullReportDisplay';
import { analyzeUrl, type AnalysisResult } from '@/lib/api/url-check';
import { useToast } from '@/hooks/use-toast';
import { useUrlHistory } from '@/hooks/use-url-history';
import { useDailyChecks } from '@/hooks/use-daily-checks';

export function MissionControlCard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [url, setUrl] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [country, setCountry] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [scanStage, setScanStage] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [urlValid, setUrlValid] = useState<boolean | null>(null);
  const { addToHistory } = useUrlHistory();
  const { toast } = useToast();
  const { isLimitReached, useCheck, resetForDemo, checksRemaining } = useDailyChecks();
  const hasAutoChecked = useRef(false);

  // Handle ?check= URL parameter from Chrome extension
  useEffect(() => {
    const checkUrl = searchParams.get('check');
    if (checkUrl && !hasAutoChecked.current) {
      hasAutoChecked.current = true;
      setUrl(checkUrl);
      setSearchParams({}, { replace: true });
      setTimeout(() => {
        if (isValidUrl(checkUrl) && !isLimitReached) {
          handleAutoSubmit(checkUrl);
        }
      }, 100);
    }
  }, [searchParams]);

  const handleAutoSubmit = async (urlToCheck: string) => {
    if (!useCheck()) return;
    
    setIsLoading(true);
    setScanStage(0);
    setResult(null);

    try {
      const analysisResult = await analyzeUrl(urlToCheck);
      setResult(analysisResult);
      addToHistory(urlToCheck, analysisResult);
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

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isLoading) {
      interval = setInterval(() => {
        setScanStage(prev => (prev < 3 ? prev + 1 : prev));
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  // URL validation with visual feedback
  const isValidUrl = (input: string): boolean => {
    const trimmed = input.trim();
    if (trimmed.includes(' ')) return false;
    const urlPattern = /^(https?:\/\/)?[\w.-]+\.[a-z]{2,}(\/.*)?$/i;
    return urlPattern.test(trimmed);
  };

  const handleUrlChange = (value: string) => {
    setUrl(value);
    if (value.trim()) {
      setUrlValid(isValidUrl(value));
    } else {
      setUrlValid(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    if (!isValidUrl(url)) {
      toast({
        title: 'Invalid URL',
        description: 'Please enter a valid website URL (e.g., example.com or https://example.com)',
        variant: 'destructive',
      });
      return;
    }

    if (!useCheck()) return;

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
    setBusinessName('');
    setCountry('');
    setUrlValid(null);
  };

  if (isLimitReached && !result) {
    return <UpgradePrompt onResetDemo={resetForDemo} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="bg-card rounded-3xl border-2 border-border/60 shadow-2xl shadow-primary/10 overflow-hidden">
        {/* Card Header */}
        <div className="px-6 py-5 border-b border-border/50 bg-gradient-to-r from-primary/5 to-secondary/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/25">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-display font-bold text-xl">Start Your Safety Check</h2>
              <p className="text-sm text-muted-foreground">Takes less than 3 minutes</p>
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <ScanningAnimation currentStage={scanStage} />
              </motion.div>
            ) : result ? (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {result.scamIndicators && (
                  <ScamWarningBanner scamIndicators={result.scamIndicators} />
                )}
                
                <div className="text-center">
                  <TrustScoreGauge score={result.trustScore} verdict={result.verdict} />
                  <h3 className="font-display font-bold text-xl mt-4">
                    {result.scrapedData?.title || result.details.domain.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    {result.summary}
                  </p>
                </div>

                <Button onClick={handleNewCheck} variant="outline" className="w-full">
                  Check Another Website
                </Button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* URL Input */}
                <div className="space-y-2">
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <Globe className="w-5 h-5" />
                    </div>
                    <Input
                      type="text"
                      value={url}
                      onChange={(e) => handleUrlChange(e.target.value)}
                      placeholder="Paste the site link here 👇"
                      className={`pl-12 pr-12 h-14 text-lg bg-background border-2 rounded-2xl transition-all ${
                        urlValid === true ? 'border-success focus:border-success' :
                        urlValid === false ? 'border-danger focus:border-danger' :
                        'border-border focus:border-primary'
                      }`}
                      disabled={isLoading}
                    />
                    {/* Validation indicator */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <AnimatePresence>
                        {urlValid === true && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                          >
                            <CheckCircle className="w-5 h-5 text-success" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                {/* Optional Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <Input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="Optional — helps us be extra accurate"
                      className="pl-10 h-12 text-sm bg-background border-2 border-border rounded-xl focus:border-primary"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <Input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="Where the business says it's located 🌎"
                      className="pl-10 h-12 text-sm bg-background border-2 border-border rounded-xl focus:border-primary"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="hero"
                  size="lg"
                  disabled={isLoading || !url.trim()}
                  className="w-full h-14 text-lg font-bold rounded-2xl hover:glow-effect"
                >
                  {isLoading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      >
                        <Shield className="w-5 h-5" />
                      </motion.div>
                      Scanning...
                    </>
                  ) : (
                    <>
                      Run Safety Check 🚀
                    </>
                  )}
                </Button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
