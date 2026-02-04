import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Chrome, X, Shield, Zap, CheckCircle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

const STORAGE_KEY = 'extension_prompt_dismissed';

export function ExtensionPrompt() {
  const [isVisible, setIsVisible] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    // Check if user has dismissed the prompt before
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed) {
      // Show after a short delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(STORAGE_KEY, 'true');
  };

  const handleInstall = () => {
    setShowInstructions(true);
  };

  const benefits = [
    { icon: Zap, text: 'One-click checks' },
    { icon: Shield, text: 'Auto-scan on risky sites' },
    { icon: CheckCircle, text: 'Always free' },
  ];

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-4 right-4 left-4 md:left-auto md:w-[420px] z-50"
          >
            <div className="relative bg-card border-2 border-primary/20 rounded-2xl shadow-2xl shadow-primary/10 overflow-hidden">
              {/* Background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
              
              {/* Close button */}
              <button
                onClick={handleDismiss}
                className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-muted transition-colors z-10"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>

              <div className="relative p-6">
                {/* Header */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/25 shrink-0">
                    <Chrome className="w-7 h-7 text-white" />
                  </div>
                  <div className="pr-6">
                    <h3 className="font-display font-bold text-lg mb-1">
                      Get the Browser Extension
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Check any website instantly without leaving the page
                    </p>
                  </div>
                </div>

                {/* Benefits */}
                <div className="flex flex-wrap gap-2 mb-5">
                  {benefits.map((benefit) => (
                    <div
                      key={benefit.text}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 border border-border/50 text-xs font-medium"
                    >
                      <benefit.icon className="w-3.5 h-3.5 text-primary" />
                      {benefit.text}
                    </div>
                  ))}
                </div>

                {/* CTA Buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={handleInstall}
                    className="flex-1 gap-2"
                    size="lg"
                  >
                    <Download className="w-4 h-4" />
                    Get Extension
                  </Button>
                  <Button
                    onClick={handleDismiss}
                    variant="ghost"
                    size="lg"
                    className="text-muted-foreground"
                  >
                    Maybe Later
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Installation Instructions Dialog */}
      <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Chrome className="w-5 h-5 text-primary" />
              Install TrustWorthy Check Extension
            </DialogTitle>
            <DialogDescription>
              Follow these steps to add the extension to Chrome
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
                1
              </div>
              <div>
                <p className="font-medium">Download the extension</p>
                <p className="text-sm text-muted-foreground">
                  <a 
                    href="https://github.com/user/trustworthy-check-extension/releases" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Download from GitHub
                  </a>
                  {" "}or contact us for the latest version.
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
                2
              </div>
              <div>
                <p className="font-medium">Open Chrome Extensions</p>
                <p className="text-sm text-muted-foreground">
                  Go to <code className="px-1.5 py-0.5 rounded bg-muted text-xs">chrome://extensions</code> in your browser
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
                3
              </div>
              <div>
                <p className="font-medium">Enable Developer Mode</p>
                <p className="text-sm text-muted-foreground">
                  Toggle "Developer mode" in the top right corner
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
                4
              </div>
              <div>
                <p className="font-medium">Load the extension</p>
                <p className="text-sm text-muted-foreground">
                  Click "Load unpacked" and select the extension folder
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowInstructions(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
