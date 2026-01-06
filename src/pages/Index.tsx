import { motion } from "framer-motion";
import { Shield, AlertTriangle, CheckCircle, Zap, Instagram, Facebook, ShoppingBag, Users, Clock, TrendingUp, BadgeCheck, Bot, Image } from "lucide-react";
import { UrlChecker } from "@/components/UrlChecker";

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
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background glow effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/10 rounded-full blur-[120px]" />
        </div>

        <div className="container relative z-10 px-4 pt-16 pb-12 md:pt-24 md:pb-16">
          {/* Header */}
          <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <Shield className="w-4 h-4" />
              Protect Yourself Before You Buy
            </div>

            <h1 className="font-display text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
              Scam or Legit -
              <span className="text-primary"> Should I?</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-4">
              Check any website before making a purchase. We analyze sites for scams, dropshippers, fake reviews,
              and security risks so you can buy with confidence.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/50">
                <ShoppingBag className="w-3.5 h-3.5" />
                Websites
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/50">
                <Instagram className="w-3.5 h-3.5" />
                Social Media
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/50">
                <Facebook className="w-3.5 h-3.5" />
                Marketplaces
              </span>
            </div>
            <p className="text-xs text-muted-foreground/70 mt-2">
              Works with {platforms.slice(0, 5).join(", ")} & more
            </p>
          </motion.div>

          {/* URL Checker */}
          <UrlChecker />
        </div>
      </div>

      {/* Features Section */}
      <section className="container px-4 py-16">
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

      {/* Social Media Checks Section */}
      <section className="container px-4 py-16 border-t border-border">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Instagram className="w-4 h-4" />
            Social Media Guidance
          </div>
          <h2 className="font-display text-3xl font-bold mb-4">Evaluating Social Sellers</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Buying from someone on Instagram, TikTok, or Facebook Marketplace? We'll help you know what red flags to look for when evaluating seller profiles.
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
              title: "Verify Profile Photos",
              description: "Reverse image search profile pictures to check if they're stolen or stock photos",
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
        
        <motion.p 
          className="text-center text-sm text-muted-foreground mt-8 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <span className="text-primary">Note:</span> Social media platforms restrict automated scanning. When you check a social URL, we provide AI-powered guidance on what to look for rather than direct profile analysis.
        </motion.p>
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
