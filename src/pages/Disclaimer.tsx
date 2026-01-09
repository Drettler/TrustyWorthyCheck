import { motion } from 'framer-motion';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';

export default function Disclaimer() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <SEO 
        title="Disclaimer"
        description="Important disclaimer for TrustworthyCheck. We provide informational content only, not financial, legal, or professional advice."
        canonical="https://trustworthycheck.com/disclaimer"
      />
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-warning/10 mb-4">
            <AlertTriangle className="w-8 h-8 text-warning" />
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
            Disclaimer
          </h1>
          <p className="text-muted-foreground">
            Important information about our service
          </p>
        </motion.div>

        {/* Main Disclaimer Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-8 rounded-xl bg-card border-2 border-warning/30"
        >
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-warning" />
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold mb-2">Important Notice</h2>
              <p className="text-muted-foreground leading-relaxed">
                TrustworthyCheck provides informational content only. We do not provide financial, legal, or professional advice. All decisions remain the responsibility of the user.
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-6 border-t border-border">
            <div className="flex items-start gap-3">
              <span className="text-warning font-bold">•</span>
              <p className="text-muted-foreground">
                <strong className="text-foreground">No Guarantees:</strong> While we strive for accuracy, we cannot guarantee that our analysis is complete, accurate, or up-to-date.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-warning font-bold">•</span>
              <p className="text-muted-foreground">
                <strong className="text-foreground">Not Professional Advice:</strong> Our content should not be considered a substitute for professional financial, legal, or security advice.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-warning font-bold">•</span>
              <p className="text-muted-foreground">
                <strong className="text-foreground">User Responsibility:</strong> You are solely responsible for any decisions you make based on information provided by TrustworthyCheck.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-warning font-bold">•</span>
              <p className="text-muted-foreground">
                <strong className="text-foreground">Third-Party Content:</strong> We are not responsible for the content, accuracy, or practices of any third-party websites we link to or analyze.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Additional Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-8 p-4 rounded-lg bg-muted/50 text-center"
        >
          <p className="text-sm text-muted-foreground">
            By using TrustworthyCheck, you acknowledge that you have read and understood this disclaimer.
          </p>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
