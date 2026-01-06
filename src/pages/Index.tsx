import { motion } from "framer-motion";
import { Shield, AlertTriangle, CheckCircle, Zap, Instagram, Facebook, ShoppingBag, Users, Clock, TrendingUp, BadgeCheck, Bot, Image, UserSearch, Globe } from "lucide-react";
import { UrlChecker } from "@/components/UrlChecker";
import { SocialSellerChecker } from "@/components/SocialSellerChecker";

const features = [
  {
    icon: Shield,
    title: "Deep Security Analysis",
    description: "SSL certificates, domain verification, and security checks",
  },
  {
    icon: AlertTriangle,
    title: "Scam Detection",
    description: "AI-powered detection of fake stores and dropshippers",
  },
  {
    icon: CheckCircle,
    title: "Trust Scoring",
    description: "Comprehensive 0-100 trust score with detailed breakdown",
  },
  {
    icon: Zap,
    title: "Instant Results",
    description: "Get comprehensive analysis in seconds",
  },
];

const platforms = [
  "Facebook", "Instagram", "TikTok", "Pinterest", "Twitter/X", 
  "eBay", "Etsy", "Amazon", "Shopify Stores"
];

export default function Index() {
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
              Protect Yourself Before You Buy
            </div>

            <h1 className="font-display text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
              Scam or Legit -
              <span className="text-primary"> Should I?</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Check any website or social media seller before making a purchase. We analyze for scams, dropshippers, fake reviews, and security risks.
            </p>
          </motion.div>

          {/* Tool Selector Tabs */}
          <motion.div 
            className="flex justify-center gap-4 mb-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <a href="#website-checker" className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors">
              <Globe className="w-4 h-4" />
              Website Checker
            </a>
            <a href="#social-seller-checker" className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-muted text-muted-foreground font-medium text-sm hover:bg-muted/80 transition-colors">
              <UserSearch className="w-4 h-4" />
              Social Seller Checker
            </a>
          </motion.div>

          {/* Website Checker Tool */}
          <div id="website-checker">
            <motion.div 
              className="text-center mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                <Globe className="w-3 h-3" />
                Tool 1: Website Analysis
              </div>
            </motion.div>
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

      {/* ===================== SOCIAL SELLER CHECKER SECTION ===================== */}
      <section id="social-seller-checker" className="relative bg-muted/30 border-y border-border">
        {/* Background accent */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-[100px]" />
        </div>
        
        <div className="container relative z-10 px-4 py-16 md:py-20">
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
              <UserSearch className="w-3 h-3" />
              Tool 2: Social Seller Analysis
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Check Social Media Sellers</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Buying from someone on Instagram, TikTok, or Facebook Marketplace? Paste their username or bio to analyze for scam patterns and red flags.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card rounded-2xl p-6 md:p-8 max-w-2xl mx-auto bg-background/80 backdrop-blur-sm"
          >
            <SocialSellerChecker />
          </motion.div>
          
          <motion.div 
            className="flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground mt-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
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
              TikTok
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-background/50 border border-border/50">
              Marketplace Sellers
            </span>
          </motion.div>
        </div>
      </section>

      {/* Social Media Tips Section */}
      <section className="container px-4 py-16 border-t border-border">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm font-medium mb-4">
            <Instagram className="w-4 h-4" />
            Manual Verification Tips
          </div>
          <h2 className="font-display text-3xl font-bold mb-4">What to Check Yourself</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            These checks require viewing the profile directly — use them alongside our AI analysis.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            {
              icon: Clock,
              title: "Check Account Age",
              description: "New accounts selling expensive items are a major red flag — look for established profiles",
            },
            {
              icon: Users,
              title: "Review Followers",
              description: "Check follower counts and follower/following ratios for signs of fake or bought followers",
            },
            {
              icon: TrendingUp,
              title: "Examine Engagement",
              description: "Low engagement or generic comments like 'nice!' may indicate bot activity",
            },
            {
              icon: BadgeCheck,
              title: "Look for Verification",
              description: "Verified badges add credibility — be wary of sellers impersonating verified accounts",
            },
            {
              icon: Bot,
              title: "Spot Bot Patterns",
              description: "Repetitive posts, no personal content, or rapid follower growth suggest automation",
            },
            {
              icon: Image,
              title: "Check Post History",
              description: "Look for consistent posting over time — sudden activity or only sales posts is suspicious",
            },
          ].map((check, index) => (
            <motion.div
              key={check.title}
              className="flex items-start gap-4 p-4 rounded-xl bg-muted/30 border border-border/50"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <check.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">{check.title}</h3>
                <p className="text-sm text-muted-foreground">{check.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

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
            { step: "01", title: "Enter URL", description: "Paste the website link you want to check" },
            {
              step: "02",
              title: "Legit Checker",
              description: "We will scan for legitimacy, bogus reviews, website securitities, and other red flags",
            },
            { step: "03", title: "Get Results", description: "Receive a detailed trust score, so you won't get scammed" },
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
        <div className="container px-4 text-center text-sm text-muted-foreground">
          <p>
            This tool provides advisory information, so you won't get scammed. We need to protect ourselves, when no one else will!  Always conduct additional research before
            making purchases.
          </p>
        </div>
      </footer>
    </div>
  );
}
