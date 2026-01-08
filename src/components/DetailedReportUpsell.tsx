import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, History, Shield, AlertTriangle, CheckCircle, Loader2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { AnalysisResult } from '@/lib/api/url-check';

const features = [
  { icon: AlertTriangle, text: 'Detailed red flags breakdown' },
  { icon: History, text: 'Full WHOIS history' },
  { icon: Shield, text: 'VirusTotal engine breakdown' },
  { icon: FileText, text: 'Screenshot archive' },
  { icon: CheckCircle, text: '"What to do next" plan' },
];

interface DetailedReportUpsellProps {
  url: string;
  trustScore: number;
  analysisResult: AnalysisResult;
}

export function DetailedReportUpsell({ url, trustScore, analysisResult }: DetailedReportUpsellProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handlePurchase = async () => {
    setIsLoading(true);
    try {
      // Store the analysis result in sessionStorage for retrieval after payment
      sessionStorage.setItem('pendingAnalysisResult', JSON.stringify(analysisResult));
      sessionStorage.setItem('pendingAnalysisUrl', url);

      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { url },
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: 'Payment Failed',
        description: 'Could not initiate payment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="mt-6 p-5 rounded-2xl bg-gradient-to-br from-primary/5 via-secondary/5 to-primary/5 border-2 border-primary/20"
    >
      <div className="text-center mb-4">
        <h3 className="font-display font-bold text-xl mb-1">🔓 Want the full breakdown?</h3>
        <p className="text-sm text-muted-foreground">
          See exactly why this site is safe or risky.
        </p>
      </div>

      <ul className="space-y-2 mb-5">
        {features.map((feature, index) => (
          <motion.li
            key={feature.text}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + index * 0.05 }}
            className="flex items-center gap-2 text-sm"
          >
            <feature.icon className="w-4 h-4 text-primary shrink-0" />
            <span>{feature.text}</span>
          </motion.li>
        ))}
      </ul>

      <Button
        onClick={handlePurchase}
        disabled={isLoading}
        className="w-full h-12 text-base font-bold rounded-xl bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            Processing...
          </>
        ) : (
          <>
            Unlock Full Trust Report — $4.99
            <ExternalLink className="w-4 h-4 ml-2 opacity-70" />
          </>
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground mt-3">
        One-time payment • Instant delivery • Money-back guarantee
      </p>
    </motion.div>
  );
}
