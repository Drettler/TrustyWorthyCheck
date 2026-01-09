import { motion } from "framer-motion";
import { Shield, Search, Zap, GraduationCap, UserCheck, Lock, CreditCard, ExternalLink } from "lucide-react";
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
    emoji: "🧠",
    icon: Zap,
    title: "Truth Meter",
    description: "Our system spots red flags like fake reviews, copied content, and suspicious pricing patterns.",
  },
  {
    emoji: "🎓",
    icon: GraduationCap,
    title: "Scam School",
    description: "Learn the warning signs so you can spot sketchy sites on your own — knowledge is your best defense!",
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
              Avoid scams and fake stores before they cost you money —{" "}
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
                🧠 No Tech Skills Needed
              </motion.span>
            </div>
          </motion.div>

          {/* URL Checker */}
          <motion.div
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
              <span>⭐</span> Trusted by parents and teens to avoid sketchy online stores every day.
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
                emoji: "🔬",
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

      {/* About Section */}
      <section id="about" className="py-20 bg-gradient-to-b from-muted/30 to-background">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/25">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Built for Real People</h2>
            <p className="text-lg text-muted-foreground mb-6">
              We created this tool because too many people lose money to fake websites. Whether you're a teen making
              your first online purchase or a parent helping your family stay safe — we've got your back.
            </p>
            <p className="text-muted-foreground">
              No jargon. No confusing reports. Just honest answers about whether a website is safe to buy from.
            </p>
          </motion.div>
        </div>
      </section>

      {/* SEO Content Section */}
      <section className="py-16 bg-background">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-4">
              Check If a Website Is Legitimate
            </h2>
            <p className="text-muted-foreground mb-4">
              TrustworthyCheck.com helps you check if a website is legit before you buy. Our website trust checker scans for scam signals, fake stores, suspicious business details, and unsafe payment practices so you can decide if a site is safe.
            </p>
            <p className="text-muted-foreground">
              If you've ever asked <span className="font-medium text-foreground">"is this website trustworthy?"</span> — this tool was built for you.
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
