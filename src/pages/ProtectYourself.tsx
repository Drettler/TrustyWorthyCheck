import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, Globe, Sparkles, ExternalLink } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { RelatedPages } from '@/components/RelatedPages';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';

const protectionServices = [
  {
    icon: Sparkles,
    title: 'All-in-One Protection',
    description: 'Get comprehensive protection with identity monitoring, password management, VPN, and more—all in one powerful package.',
    url: 'https://aurainc.sjv.io/c/6856789/1320868/12398',
    color: 'from-purple-500 to-pink-500',
    featured: true,
  },
  {
    icon: Shield,
    title: 'Identity Protection',
    description: 'Monitor your personal information across the dark web and get alerts when your data appears in breaches. Protect your SSN, email, and financial accounts.',
    url: 'https://identityguard.y8uw.net/DGT10',
    color: 'from-blue-500 to-cyan-500',
    featured: false,
  },
  {
    icon: Lock,
    title: 'Password Security',
    description: 'Use a secure password manager to generate and store strong, unique passwords for all your accounts. Never reuse passwords again.',
    url: 'https://aurainc.sjv.io/c/6856789/1320868/12398',
    color: 'from-emerald-500 to-teal-500',
    featured: false,
  },
  {
    icon: Globe,
    title: 'VPN Protection',
    description: 'Secure your internet connection and protect your online privacy. Browse safely on public WiFi and keep your data encrypted.',
    url: 'https://aurainc.sjv.io/c/6856789/1320868/12398',
    color: 'from-orange-500 to-amber-500',
    featured: false,
  },
];

export default function ProtectYourself() {
  const [showStickyCTA, setShowStickyCTA] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const isScrollingDown = currentScrollY > lastScrollY;
      const isPastHero = currentScrollY > 400;
      
      // Show sticky CTA when scrolling down past hero section
      setShowStickyCTA(isPastHero && isScrollingDown);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Protect Yourself Online"
        description="Essential tools for online safety: identity protection, password security, and payment safety. Protect yourself from scams and data breaches."
        canonical="https://trustworthycheck.com/protect-yourself"
      />
      <Header />
      
      <main className="container px-4 py-16 md:py-24">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Shield className="w-4 h-4" />
            Extra Protection
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-6">
            Protect Yourself Online
          </h1>
          <p className="text-lg text-muted-foreground">
            Checking websites is just the first step. These trusted tools help you stay safe 
            with identity monitoring, secure passwords, and protected payments.
          </p>
        </motion.div>

        {/* Protection Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-16">
          {protectionServices.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`group relative rounded-2xl p-8 transition-all duration-300 ${
                service.featured 
                  ? 'bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-purple-500/10 border-2 border-purple-500/50 hover:border-purple-400 hover:shadow-2xl hover:shadow-purple-500/20 md:col-span-2 lg:col-span-1' 
                  : 'bg-card border border-border hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5'
              }`}
            >
              {service.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-xs font-bold text-white">
                  RECOMMENDED
                </div>
              )}
              {/* Icon */}
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <service.icon className="w-7 h-7 text-white" />
              </div>
              
              {/* Content */}
              <h2 className="text-xl font-bold mb-3">{service.title}</h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                {service.description}
              </p>
              
              {/* Launch Button */}
              <Button
                variant={service.featured ? "default" : "outline"}
                className={`w-full transition-colors ${
                  service.featured 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 text-white font-bold' 
                    : 'group-hover:bg-primary group-hover:text-primary-foreground'
                }`}
                asChild
              >
                <a href={service.url} target="_blank" rel="noopener noreferrer">
                  {service.featured ? 'Get Protected Now' : 'Launch'}
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Why This Matters Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="max-w-3xl mx-auto text-center bg-muted/50 rounded-2xl p-8 md:p-12"
        >
          <h2 className="text-2xl font-bold mb-4">Why These Tools Matter</h2>
          <p className="text-muted-foreground leading-relaxed">
            Scammers don't just create fake websites—they steal identities, crack weak passwords, 
            and intercept payment information. By combining TrustWorthy Check with these protection 
            services, you create multiple layers of defense against online threats. Stay proactive, 
            stay protected.
          </p>
        </motion.div>
      </main>

      <RelatedPages currentPage="protect-yourself" />
      <Footer />

      {/* Sticky Mobile CTA */}
      <AnimatePresence>
        {showStickyCTA && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-40 md:hidden"
          >
            <div className="bg-background/95 backdrop-blur-lg border-t shadow-[0_-4px_20px_rgba(0,0,0,0.1)] px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">Stay protected online</p>
                  <p className="text-xs text-muted-foreground">Identity, passwords & payments</p>
                </div>
                <Button
                  variant="hero"
                  size="sm"
                  className="gap-1.5 flex-shrink-0 shadow-lg"
                  asChild
                >
                  <a href={protectionServices[0].url} target="_blank" rel="noopener noreferrer">
                    <Shield className="w-4 h-4" />
                    Protect
                  </a>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
