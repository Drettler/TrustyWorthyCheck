import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const CONSENT_KEY = 'cookie-consent-accepted';

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already consented
    const hasConsented = localStorage.getItem(CONSENT_KEY);
    if (!hasConsented) {
      // Small delay before showing banner for better UX
      const timer = setTimeout(() => setShowBanner(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem(CONSENT_KEY, 'all');
    setShowBanner(false);
  };

  const acceptEssential = () => {
    localStorage.setItem(CONSENT_KEY, 'essential');
    setShowBanner(false);
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
        >
          <div className="max-w-4xl mx-auto">
            <div className="bg-card border border-border rounded-2xl shadow-2xl p-4 md:p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                {/* Icon & Text */}
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Cookie className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm mb-1">We use cookies</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      We use cookies for analytics, performance, and affiliate tracking to improve your experience. 
                      By clicking "Accept All", you consent to our use of cookies. 
                      <Link to="/privacy" className="text-primary hover:underline ml-1">
                        Learn more
                      </Link>
                    </p>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={acceptEssential}
                    className="flex-1 md:flex-none text-xs"
                  >
                    Essential Only
                  </Button>
                  <Button
                    size="sm"
                    onClick={acceptAll}
                    className="flex-1 md:flex-none text-xs bg-primary hover:bg-primary/90"
                  >
                    Accept All
                  </Button>
                  <button
                    onClick={acceptEssential}
                    className="p-1.5 rounded-lg hover:bg-muted transition-colors md:hidden"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
