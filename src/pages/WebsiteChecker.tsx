import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { UrlChecker } from '@/components/UrlChecker';
import { SEO } from '@/components/SEO';
import { Shield, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';

export default function WebsiteChecker() {
  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Free Website Safety Checker | TrustworthyCheck"
        description="Check if any website is safe before you visit or buy. Our free tool analyzes URLs for scams, phishing, and malware in seconds."
        canonical="https://trustworthycheck.com/website-checker"
      />
      
      <Header />
      
      <main className="container px-4 py-12 md:py-20">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Shield className="w-4 h-4" />
            Free Website Safety Tool
          </div>
          
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Is This Website <span className="text-primary">Safe?</span>
          </h1>
          
          <p className="text-lg text-muted-foreground">
            Paste any URL below to instantly check if a website is legitimate, secure, and trustworthy. 
            Protect yourself from scams, phishing sites, and online fraud.
          </p>
        </motion.div>

        {/* URL Checker Component */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          id="checker"
        >
          <UrlChecker />
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto"
        >
          <div className="text-center p-6 rounded-2xl bg-card border border-border">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            </div>
            <h3 className="font-semibold mb-2">Instant Analysis</h3>
            <p className="text-sm text-muted-foreground">
              Get results in seconds with our advanced scanning technology
            </p>
          </div>

          <div className="text-center p-6 rounded-2xl bg-card border border-border">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-amber-500" />
            </div>
            <h3 className="font-semibold mb-2">Threat Detection</h3>
            <p className="text-sm text-muted-foreground">
              Identify phishing, malware, and suspicious websites
            </p>
          </div>

          <div className="text-center p-6 rounded-2xl bg-card border border-border">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Clock className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Always Updated</h3>
            <p className="text-sm text-muted-foreground">
              Real-time threat intelligence from multiple sources
            </p>
          </div>
        </motion.div>

        {/* SEO Content */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-20 max-w-3xl mx-auto text-center"
        >
          <h2 className="text-2xl font-display font-bold mb-4">
            How Our Website Checker Works
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Our free website safety checker analyzes multiple factors including domain age, 
            SSL certificates, known threat databases, and user reports to determine if a 
            website is safe to visit. Whether you're shopping online, clicking a link from 
            an email, or just browsing, always verify before you trust.
          </p>
        </motion.section>
      </main>

      <Footer />
    </div>
  );
}
