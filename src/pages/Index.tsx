import { motion } from "framer-motion";
import { Shield, Search, Zap, UserCheck, Lock, CreditCard, ExternalLink } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MissionControlCard } from "@/components/MissionControlCard";
import { FeatureCard } from "@/components/FeatureCard";
import { StepGuide } from "@/components/StepGuide";
import { UrlChecker } from "@/components/UrlChecker";
import { Button } from "@/components/ui/button";

const features = [
  {
    emoji: "🛡️",
    icon: Shield,
    title: "Security Shield",
    description:
      "We check if the website has proper security certificates, safe payment processing, and data protection.",
  },
  {
    emoji: "🔍",
    icon: Search,
    title: "Business X-Ray",
    description: "We look up who owns the website, how long it's been around, and if the business info checks out.",
  },
  {
    emoji: "👼",
    icon: Zap,
    title: "Truth Meter",
    description: "Our system spots red flags like fake reviews, copied content, and suspicious pricing patterns.",
  },
  {
    emoji: "🚨",
    icon: Zap,
    title: "Scam Alerts",
    description: "Stay ahead of trending scams, fake store patterns, and fraud warnings circulating right now.",
    link: "/recent-reports",
  },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      {/* Friendly helper in corner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.4 }}
        className="fixed bottom-6 right-6 z-50 hidden md:flex items-center gap-2 bg-card/95 backdrop-blur-sm px-4 py-3 rounded-full shadow-lg border border-border hover:shadow-xl transition-shadow cursor-default"
      >
        <span className="text-2xl hover-wiggle">🛡️</span>
        <span className="text-sm font-medium text-muted-foreground">I'll help you spot sketchy sites.</span>
      </motion.div>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Soft gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-secondary/5 to-background pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-primary/10 to-transparent rounded-full blur-[120px] pointer-events-none" />

        {/* Animated gradient blobs */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 pointer-events-none">
          <div className="absolute w-[500px] h-[500px] -left-[250px] -top-[100px] bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-full blur-[80px] animate-blob-drift" />
          <div className="absolute w-[400px] h-[400px] -left-[100px] -top-[50px] bg-gradient-to-br from-secondary/15 via-secondary/5 to-transparent rounded-full blur-[60px] animate-blob-drift-reverse" />
          <div
            className="absolute w-[300px] h-[300px] left-[50px] top-[50px] bg-gradient-to-br from-primary/15 to-secondary/10 rounded-full blur-[70px] animate-blob-drift"
            style={{ animationDelay: "-4s" }}
          />
        </div>

        <div className="container relative z-10 px-4 pt-16 pb-12 md:pt-24 md:pb-20">
          <motion.div className="text-center mb-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Headline */}
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-4 leading-tight">
              Should I Trust This Site? <span className="inline-block hover-wiggle">🛡️</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Avoid scams, fake sites and stores before they cost you money —{" "}
              <span className="text-foreground font-medium">in under 2 minutes.</span>
            </p>

            {/* Pill Badges */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/30 text-success font-medium text-sm"
              >
                🧒 Teen-Safe
              </motion.span>
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary font-medium text-sm"
              >
                👪 Parent-Approved
              </motion.span>
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/30 text-secondary font-medium text-sm"
              >
                🤖 No Tech Skills Needed
              </motion.span>
            </div>
          </motion.div>

          {/* URL Checker */}
          <motion.div
            id="checker"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <UrlChecker />
          </motion.div>

          {/* Step Guide - below the checker */}
          <StepGuide />

          {/* Trust Statement */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-sm text-muted-foreground mt-10 max-w-md mx-auto"
          >
            💚 We never take money to change results. Ever.{" "}
            <span className="font-medium text-foreground">Your safety comes first.</span>
          </motion.p>

          {/* First-timer tip */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center text-sm text-muted-foreground mt-4 max-w-lg mx-auto"
          >
            🧒 First time checking a site? Try a random shop you've seen on TikTok or Instagram.
          </motion.p>
        </div>
      </section>

      {/* Features Section */}
      <section id="learn" className="py-20 bg-muted/30">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">🔒 How We Help</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We combine real-world scam patterns, security checks, and transparency signals to give you a clear,
              unbiased verdict.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                icon={feature.icon}
                emoji={feature.emoji}
                title={feature.title}
                description={feature.description}
                index={index}
                link={feature.link}
              />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section (detailed) */}
      <section id="reports" className="py-20">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Simple as 1-2-3</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              No complicated steps. Just paste, wait, and know if it's safe.
            </p>
            <p className="text-sm text-muted-foreground mt-4 flex items-center justify-center gap-1">
              <span>⭐</span> Trusted by parents and teens to avoid sketchy online sites every day.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: "1",
                emoji: "📋",
                title: "Paste the Link",
                description: "Copy the website address from your browser or message and paste it in our checker.",
              },
              {
                step: "2",
                emoji: "📡",
                title: "We Do the Work",
                description: "Our system checks security, reviews business info, and scans for common scam patterns.",
              },
              {
                step: "3",
                emoji: "✅",
                title: "Get Your Answer",
                description: "See a clear, simple verdict with explanations you can actually understand.",
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="text-center"
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mx-auto mb-6 border-2 border-border">
                  <span className="text-4xl">{item.emoji}</span>
                </div>
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm mb-4">
                  {item.step}
                </div>
                <h3 className="font-display font-bold text-xl mb-3">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section - Built for Real People */}
      <section id="about" className="py-24 bg-gradient-to-b from-muted/30 to-background">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto text-center"
          >
            {/* Shield Icon with Glow */}
            <div className="relative mb-8">
              <div className="absolute inset-0 w-20 h-20 mx-auto rounded-2xl bg-primary/30 blur-xl" />
              <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto shadow-xl shadow-primary/25">
                <Shield className="w-10 h-10 text-white" />
              </div>
            </div>

            {/* Headline */}
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
              Built for Real People
            </h2>

            {/* Sub-headline */}
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 leading-relaxed">
              Because losing money to fake websites should not be part of growing up, parenting, or gift shopping.
            </p>

            {/* Body text */}
            <div className="space-y-6 text-lg text-muted-foreground leading-relaxed mb-10">
              <p>
                We built TrustworthyCheck for everyday people who just want to shop safely.
                Whether you are a teen buying your first hoodie, a parent protecting your family, 
                or a friend trying not to mess up a birthday gift, we have your back.
              </p>
              <p>
                No jargon. No confusing reports.<br />
                Just clear, honest answers about whether a website is safe to buy from.
              </p>
            </div>

            {/* Brand line */}
            <p className="text-sm text-muted-foreground/70 font-medium tracking-wide mb-12">
              Confidence in every click. Cashback in every cart.
            </p>

            {/* Trust accent row */}
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 text-primary text-sm font-medium">
                🛡️ Safe Shopping
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/5 text-secondary text-sm font-medium">
                👨‍👩‍👧 Family Friendly
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/5 text-success text-sm font-medium">
                💸 Save While You Shop
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SEO Content Section - Check If a Website Is Legitimate */}
      <section className="py-20 bg-background">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto text-center"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-8">
              Check If a Website Is Legitimate
            </h2>
            
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              TrustworthyCheck.com helps you verify a website before you buy.
              Our trust checker scans for scam signals, fake stores, suspicious business details, 
              and unsafe payment practices so you can make smarter decisions online.
            </p>
            
            <p className="text-lg text-foreground/80 leading-relaxed italic">
              If you have ever asked, <span className="font-semibold text-foreground">"Is this website actually trustworthy?"</span><br />
              This tool was built for you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Extra Protection Section */}
      <section className="py-20 bg-muted/30">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">💪 Want Extra Protection?</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Go beyond checking websites — protect yourself everywhere online.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                icon: UserCheck,
                emoji: "🛡",
                title: "Identity Protection",
                description: "Protect your identity and credit if a site feels unsafe.",
                button: "Protect My Identity",
                href: "https://www.identityguard.com/",
              },
              {
                icon: Lock,
                emoji: "🔐",
                title: "Password Security",
                description: "Stop password leaks and account takeovers.",
                button: "Secure My Accounts",
                href: "https://bitwarden.com/",
              },
              {
                icon: CreditCard,
                emoji: "💳",
                title: "Payment Safety",
                description: "Use protected payments when buying online.",
                button: "Protect My Payment",
                href: "https://privacy.com/",
              },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-2xl p-6 border border-border shadow-soft hover:shadow-card transition-shadow text-center"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">{item.emoji}</span>
                </div>
                <h3 className="font-display font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full group"
                  onClick={() => window.open(item.href, "_blank", "noopener,noreferrer")}
                >
                  {item.button}
                  <ExternalLink className="w-3 h-3 ml-1 opacity-50 group-hover:opacity-100 transition-opacity" />
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
