import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Download, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const type = searchParams.get('type');
  const [countdown, setCountdown] = useState(10);

  const isSubscription = type === 'proMonthly';

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle className="w-10 h-10 text-success" />
        </motion.div>

        <h1 className="font-display text-3xl font-bold mb-3">
          Payment Successful!
        </h1>

        <p className="text-muted-foreground mb-6">
          {isSubscription
            ? "Welcome to Pro! You now have unlimited checks and full detailed reports."
            : "Your report has been unlocked. You can now view the full analysis."}
        </p>

        <div className="glass-card rounded-xl p-6 mb-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-5 h-5 text-primary" />
            <span className="font-semibold">
              {isSubscription ? 'Pro Member' : 'Full Report Access'}
            </span>
          </div>

          <ul className="text-sm text-muted-foreground space-y-2">
            {isSubscription ? (
              <>
                <li>✓ Unlimited daily checks</li>
                <li>✓ Full detailed reports</li>
                <li>✓ WHOIS & domain history</li>
                <li>✓ Priority analysis speed</li>
              </>
            ) : (
              <>
                <li>✓ Complete scam analysis</li>
                <li>✓ Printable PDF report</li>
                <li>✓ Saved to your history</li>
              </>
            )}
          </ul>
        </div>

        <Button onClick={() => navigate('/')} size="lg" className="w-full mb-4">
          <ArrowRight className="w-4 h-4 mr-2" />
          Start Checking Sites
        </Button>

        <p className="text-xs text-muted-foreground">
          Redirecting in {countdown} seconds...
        </p>
      </motion.div>
    </div>
  );
}
