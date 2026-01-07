import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, AlertTriangle, CheckCircle, Zap, Instagram, Facebook, ShoppingBag, Users, Clock, TrendingUp, BadgeCheck, Bot, Image, UserSearch, Globe, Linkedin, ChevronDown, ChevronUp } from "lucide-react";
import { UrlChecker } from "@/components/UrlChecker";
import { SocialSellerChecker } from "@/components/SocialSellerChecker";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Shield,
    title: "Security Checks",
    description: "SSL certificates, domain age, and encryption verification",
  },
  {
    icon: AlertTriangle,
    title: "Transparency Indicators",
    description: "Business contact info, policies, and registration details",
  },
  {
    icon: CheckCircle,
    title: "Trust Assessment",
    description: "Evidence-based scoring with detailed breakdown",
  },
  {
    icon: Zap,
    title: "Educational Guidance",
    description: "Learn what to look for when evaluating websites",
  },
];

const platforms = [
  "Facebook", "Instagram", "TikTok", "Pinterest", "Twitter/X", 
  "eBay", "Etsy", "Amazon", "Shopify Stores"
];

export default function Index() {
  const [showSocialChecker, setShowSocialChecker] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* ===================== WEBSITE CHECKER SECTION ===================== */}
      <div className="relative overflow-hidden">
        {/* Background glow effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/10 rounded-full blur-[120px]" />
        </div>

        <div className="container relative z-10 px-4 pt-16 pb-12 md:pt-24 md:pb-16">
          {/* Main Header */}
          <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <Shield className="w-4 h-4" />
              Research Before You Purchase
            </div>

            <h1 className="font-display text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
              Is This Website
              <span className="text-primary"> Trustworthy?</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Make informed decisions before purchasing online. Our tool helps you evaluate website legitimacy through security checks and transparency indicators.
            </p>
          </motion.div>

          {/* Website Checker Tool */}
          <div id="website-checker">
            <UrlChecker />
            
            <motion.div 
              className="flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/50">
                <ShoppingBag className="w-3.5 h-3.5" />
                Online Stores
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/50">
                <Instagram className="w-3.5 h-3.5" />
                Social Links
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/50">
                <Facebook className="w-3.5 h-3.5" />
                Marketplaces
              </span>
            </motion.div>
            <p className="text-xs text-muted-foreground/70 mt-2 text-center">
              Works with {platforms.slice(0, 5).join(", ")} & more
            </p>
          </div>
        </div>
      </div>

      {/* Website Checker Features */}
      <section className="container px-4 py-12">
        <motion.div
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="glass-card rounded-xl p-6 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ===================== SOCIAL SELLER CHECKER TOGGLE ===================== */}
      <section className="container px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          onClick={() => setShowSocialChecker(!showSocialChecker)}
          className="relative cursor-pointer group max-w-2xl mx-auto"
        >
          <div className={`flex items-center justify-between gap-4 p-5 rounded-2xl border-2 transition-all duration-300 ${
            showSocialChecker 
              ? 'bg-primary/10 border-primary/30' 
              : 'bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-primary/20 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10'
          }`}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                showSocialChecker ? 'bg-primary text-primary-foreground' : 'bg-primary/15 text-primary group-hover:bg-primary group-hover:text-primary-foreground'
              }`}>
                <UserSearch className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h3 className="font-display font-semibold text-lg">
                  {showSocialChecker ? "Social Seller Checker" : "Need to check a social media seller?"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Evaluate sellers on Instagram, TikTok, Facebook & more
                </p>
              </div>
            </div>
            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              showSocialChecker 
                ? 'bg-primary/20 text-primary rotate-180' 
                : 'bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary'
            }`}>
              <ChevronDown className="w-5 h-5 transition-transform duration-300" />
            </div>
          </div>
        </motion.div>
      </section>

      {/* ===================== SOCIAL SELLER CHECKER SECTION ===================== */}
      <AnimatePresence>
        {showSocialChecker && (
          <motion.section
            id="social-seller-checker"
            className="relative bg-muted/30 border-y border-border"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Background accent */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-[100px]" />
            </div>
            
            <div className="container relative z-10 px-4 py-16 md:py-20">
              <motion.div
                className="text-center mb-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
                  <UserSearch className="w-3 h-3" />
                  Social Seller Analysis
                </div>
                <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Evaluate Social Media Sellers</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Considering a purchase from someone on Instagram, TikTok, Facebook Marketplace, or LinkedIn? Enter their username or bio text to review common trust indicators.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card rounded-2xl p-6 md:p-8 max-w-2xl mx-auto bg-background/80 backdrop-blur-sm"
              >
                <SocialSellerChecker />
              </motion.div>
              
              <motion.div 
                className="flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground mt-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-background/50 border border-border/50">
                  <Instagram className="w-3.5 h-3.5" />
                  Instagram
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-background/50 border border-border/50">
                  <Facebook className="w-3.5 h-3.5" />
                  Facebook
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-background/50 border border-border/50">
                  <Linkedin className="w-3.5 h-3.5" />
                  LinkedIn
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-background/50 border border-border/50">
                  TikTok
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-background/50 border border-border/50">
                  Marketplace Sellers
                </span>
              </motion.div>

              {/* Social Media Tips */}
              <div className="mt-12 pt-8 border-t border-border/50">
                <h3 className="font-display text-xl font-bold text-center mb-6">What to Check Yourself</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
                  {[
                    {
                      icon: Clock,
                      title: "Check Account Age",
                      description: "New accounts selling expensive items are a major red flag",
                    },
                    {
                      icon: Users,
                      title: "Review Followers",
                      description: "Check follower counts and ratios for signs of fake followers",
                    },
                    {
                      icon: TrendingUp,
                      title: "Examine Engagement",
                      description: "Low engagement or generic comments may indicate bots",
                    },
                    {
                      icon: BadgeCheck,
                      title: "Look for Verification",
                      description: "Verified badges add credibility to seller accounts",
                    },
                    {
                      icon: Bot,
                      title: "Spot Bot Patterns",
                      description: "Repetitive posts or rapid follower growth suggest automation",
                    },
                    {
                      icon: Image,
                      title: "Check Post History",
                      description: "Consistent posting over time indicates legitimacy",
                    },
                  ].map((check, index) => (
                    <motion.div
                      key={check.title}
                      className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border border-border/30"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.05 }}
                    >
                      <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <check.icon className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm mb-0.5">{check.title}</h4>
                        <p className="text-xs text-muted-foreground">{check.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* How It Works */}
      <section className="container px-4 py-16 border-t border-border">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="font-display text-3xl font-bold mb-4">How It Works</h2>
          <p className="text-muted-foreground">Three simple steps to verify any website</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {[
            { step: "01", title: "Enter URL", description: "Paste the website link you want to evaluate" },
            {
              step: "02",
              title: "Automated Analysis",
              description: "We run security checks and gather transparency indicators automatically",
            },
            { step: "03", title: "Review Results", description: "Get an evidence-based assessment with clear explanations" },
          ].map((item, index) => (
            <motion.div
              key={item.step}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
            >
              <div className="text-5xl font-display font-bold text-primary/20 mb-4">{item.step}</div>
              <h3 className="font-display font-semibold text-lg mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container px-4 text-center text-sm text-muted-foreground space-y-4">
          <p>
            This tool provides educational information to help you make informed decisions. Results are based on automated checks and should be used alongside your own research. Always verify important details before making purchases.
          </p>
          <p className="text-xs text-muted-foreground/60">
            Powered by <span className="font-medium">TrustworthyCheck</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
