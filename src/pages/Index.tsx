import { motion } from "framer-motion";
import { Shield, AlertTriangle, CheckCircle, Zap } from "lucide-react";
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

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Check any website before making a purchase. We will analyze sites for scams, dropshippers, fake reviews,
              and security risks so you can buy with confidence.
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
