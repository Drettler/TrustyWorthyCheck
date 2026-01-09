import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Shield, Sparkles, FileText, Eye, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FullReportDisplay } from '@/components/FullReportDisplay';
import type { AnalysisResult } from '@/lib/api/url-check';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session_id');
  const [showFullReport, setShowFullReport] = useState(false);
  
  // Try to get stored analysis result
  const [storedResult, setStoredResult] = useState<AnalysisResult | null>(null);
  const [storedUrl, setStoredUrl] = useState<string>('');

  useEffect(() => {
    // Retrieve the stored analysis result from localStorage (works across tabs)
    const savedResult = localStorage.getItem('pendingAnalysisResult');
    const savedUrl = localStorage.getItem('pendingAnalysisUrl');
    
    if (savedResult) {
      try {
        const parsed = JSON.parse(savedResult);
        setStoredResult(parsed);
        setStoredUrl(savedUrl || '');
        // Auto-show the full report immediately after payment
        setShowFullReport(true);
        // Clear the stored data after retrieving
        localStorage.removeItem('pendingAnalysisResult');
        localStorage.removeItem('pendingAnalysisUrl');
      } catch (e) {
        console.error('Error parsing stored result:', e);
      }
    }
  }, []);

  // Fallback handler if user somehow sees the success page without auto-redirect
  const handleViewReport = () => {
    if (storedResult) {
      setShowFullReport(true);
    }
  };

  // Show the full report if requested
  if (showFullReport && storedResult) {
    return (
      <div className="min-h-screen bg-background p-6">
        <FullReportDisplay 
          result={storedResult} 
          url={storedUrl}
          onBack={() => navigate('/')}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg w-full"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle className="w-10 h-10 text-success" />
        </motion.div>

        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold mb-3">
            Payment Successful!
          </h1>
          <p className="text-muted-foreground">
            Thank you for your purchase. Your full report is now ready to view.
          </p>
        </div>

        {/* What's Included Card */}
        <motion.div 
          className="rounded-2xl border border-border bg-card p-6 mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="font-semibold">Your Full Report Includes</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
              <Shield className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Complete Security Analysis</p>
                <p className="text-xs text-muted-foreground">VirusTotal scan results, threat detection, and safety rating</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
              <FileText className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">WHOIS & Domain History</p>
                <p className="text-xs text-muted-foreground">Registration details, domain age, and registrar information</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
              <Eye className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Business Legitimacy Check</p>
                <p className="text-xs text-muted-foreground">Contact verification, policies, and trust indicators</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
              <Clock className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Pricing & Market Analysis</p>
                <p className="text-xs text-muted-foreground">Price comparison and suspicious pricing detection</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div 
          className="space-y-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {storedResult ? (
            <Button onClick={handleViewReport} size="lg" className="w-full gap-2">
              <Eye className="w-4 h-4" />
              View Your Full Report
            </Button>
          ) : (
            <div className="text-center p-4 rounded-lg bg-muted/30 border border-border">
              <p className="text-sm text-muted-foreground mb-3">
                Your report is ready! Return to the checker to analyze any website with your unlocked access.
              </p>
              <Button onClick={() => navigate('/')} size="lg" className="w-full gap-2">
                <ArrowRight className="w-4 h-4" />
                Go to Website Checker
              </Button>
            </div>
          )}
          
          <Button variant="outline" onClick={() => navigate('/')} className="w-full">
            Check Another Website
          </Button>
        </motion.div>

        {/* Receipt Note */}
        <p className="text-xs text-muted-foreground text-center mt-6">
          A receipt has been sent to your email. Transaction ID: {sessionId?.slice(0, 20)}...
        </p>
      </motion.div>
    </div>
  );
}
