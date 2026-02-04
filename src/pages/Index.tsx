import { memo } from "react";
import { motion } from "framer-motion";
import { Shield, AlertTriangle, DollarSign, Search, Zap, UserCheck, Lock, CreditCard, ExternalLink } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FeatureCard } from "@/components/FeatureCard";
import { StepGuide } from "@/components/StepGuide";
import { UrlChecker } from "@/components/UrlChecker";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { Link } from "react-router-dom";
import { ExtensionPrompt } from "@/components/ExtensionPrompt";

const features = [
  {
    emoji: "🛡️",
    icon: Shield,
    title: "Safe Shopping",
    description:
      "We check if the website has proper security certificates, safe payment processing, and data protection.",
    link: "/save-money",
  },
  {
    emoji: "🔍",
    icon: Search,
    title: "Business X-Ray",
    description: "We look up who owns the website, how long it's been around, and if the business info checks out.",
  },
  {
    emoji: "🚨",
    icon: Zap,
    title: "Live Threat Feed",
    description: "See real-time scam alerts, newly reported fake stores, and emerging fraud patterns as they happen.",
    link: "/threats-feed",
  },
  {
    emoji: "💸",
    icon: CreditCard,
    title: "Save While You Shop",
    description: "Get cashback on verified safe sites. Shop smart and earn rewards at trusted stores.",
    link: "/save-money",
  },
];

const controlPanelCards = [
  {
    icon: Shield,
    title: "Check a Website",
    description: "Paste a link to instantly see if a site is safe.",
    buttonText: "Run Safety Check",
    action: "scroll",
    color: "primary",
    emoji: "🛡️",
  },
  {
    icon: AlertTriangle,
    title: "View Current Threats",
    description: "See newly reported scams and fraud patterns.",
    buttonText: "Live Threat Feed",
    action: "/threats-feed",
    color: "destructive",
    emoji: "🚨",
  },
  {
    icon: DollarSign,
    title: "Save Money Shopping",
    description: "Earn cashback at verified safe stores.",
    buttonText: "Activate Cashback",
    action: "/save-money",
    color: "success",
    emoji: "💰",
  },
  {
    icon: Lock,
    title: "Protect Yourself",
    description: "Identity monitoring, passwords & payment safety.",
    buttonText: "Get Protected",
    action: "/protect-yourself",
    color: "info",
    emoji: "🔐",
  },
];

export default function Index() {
  const scrollToChecker = () => {
    const checker = document.getElementById("checker");
    if (checker) {
      checker.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How do I check if a website is legit?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Paste the website URL into TrustworthyCheck's free scanner. We analyze domain age, SSL certificates, business registration, user reports, and known scam databases to give you a trust score and safety verdict in under 2 minutes."
        }
      },
      {
        "@type": "Question",
        "name": "Is TrustworthyCheck free to use?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! TrustworthyCheck offers free website safety checks. You get 3 free scans per day. For unlimited scans and detailed PDF reports, you can upgrade to our premium plan."
        }
      },
      {
        "@type": "Question",
        "name": "What does a website trust score mean?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The trust score (0-100) indicates how safe a website is. Scores above 70 are generally safe, 40-70 require caution, and below 40 are high-risk."
        }
      }
    ]
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Spot Scams Before They Cost You"
        description="Check if a website is legit before you buy. TrustworthyCheck scans for scams, fake stores, unsafe payments, and suspicious business details in under 3 minutes."
        canonical="https://trustworthycheck.com/"
        jsonLd={faqSchema}
      />
      <Header />

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

        <div className="container relative z-10 px-4 pt-12 pb-8 md:pt-20 md:pb-12">
          <motion.div className="text-center mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Headline */}
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
              Should I Trust This Site? <span className="inline-block hover-wiggle">🛡️</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
              Check a website before you buy, stay ahead of scams, and save money while you shop —{" "}
              <span className="text-foreground font-medium">all in under 3 minutes.</span>
            </p>

            {/* Pill Badges */}
            <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-success/10 border border-success/30 text-success font-medium text-xs md:text-sm"
              >
                🧒 Teen-Safe
              </motion.span>
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-primary/10 border border-primary/30 text-primary font-medium text-xs md:text-sm"
              >
                👪 Parent-Approved
              </motion.span>
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-secondary/10 border border-secondary/30 text-secondary font-medium text-xs md:text-sm"
              >
                🤖 No Tech Skills Needed
              </motion.span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Primary Control Panel */}
      <section className="relative z-10 -mt-2 pb-12">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="text-center mb-8"
          >
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
              What do you want to do?
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 max-w-6xl mx-auto mb-12">
            {controlPanelCards.map((card, index) => {
              const Icon = card.icon;
              const isScrollAction = card.action === "scroll";
              
              return (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className={`
                    group relative overflow-hidden rounded-2xl bg-card border-2 
                    ${card.color === "primary" ? "border-primary/20 hover:border-primary/40" : ""}
                    ${card.color === "destructive" ? "border-destructive/20 hover:border-destructive/40" : ""}
                    ${card.color === "success" ? "border-success/20 hover:border-success/40" : ""}
                    ${card.color === "info" ? "border-blue-500/20 hover:border-blue-500/40" : ""}
                    p-5 md:p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1
                  `}
                >
                  {/* Background glow */}
                  <div 
                    className={`
                      absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300
                      ${card.color === "primary" ? "bg-gradient-to-br from-primary/5 to-transparent" : ""}
                      ${card.color === "destructive" ? "bg-gradient-to-br from-destructive/5 to-transparent" : ""}
                      ${card.color === "success" ? "bg-gradient-to-br from-success/5 to-transparent" : ""}
                      ${card.color === "info" ? "bg-gradient-to-br from-blue-500/5 to-transparent" : ""}
                    `}
                  />
                  
                  <div className="relative z-10">
                    {/* Icon */}
                    <div 
                      className={`
                        w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center mb-4
                        ${card.color === "primary" ? "bg-primary/10 text-primary" : ""}
                        ${card.color === "destructive" ? "bg-destructive/10 text-destructive" : ""}
                        ${card.color === "success" ? "bg-success/10 text-success" : ""}
                        ${card.color === "info" ? "bg-blue-500/10 text-blue-500" : ""}
                      `}
                    >
                      <span className="text-2xl md:text-3xl">{card.emoji}</span>
                    </div>

                    {/* Title */}
                    <h3 className="font-display text-lg md:text-xl font-bold mb-2 text-foreground">
                      {card.title}
                    </h3>

                    {/* Description */}
                    <p className="text-muted-foreground text-sm mb-4 md:mb-5 line-clamp-2">
                      {card.description}
                    </p>

                    {/* Button */}
                    {isScrollAction ? (
                      <Button
                        onClick={scrollToChecker}
                        size="default"
                        className={`
                          w-full font-semibold
                          ${card.color === "primary" ? "bg-primary hover:bg-primary/90" : ""}
                        `}
                      >
                        {card.buttonText}
                      </Button>
                    ) : (
                      <Button
                        asChild
                        size="default"
                        variant={card.color === "destructive" ? "destructive" : "default"}
                        className={`
                          w-full font-semibold
                          ${card.color === "success" ? "bg-success hover:bg-success/90 text-success-foreground" : ""}
                          ${card.color === "info" ? "bg-blue-500 hover:bg-blue-600 text-white" : ""}
                        `}
                      >
                        <Link to={card.action}>
                          {card.buttonText}
                        </Link>
                      </Button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* URL Checker */}
          <motion.div
            id="checker"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            <UrlChecker />
          </motion.div>
        </div>
      </section>

      {/* How We Help Section */}
      <section id="learn" className="py-16 md:py-20 bg-muted/30">
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

      {/* Simple as 1-2-3 Section */}
      <section id="reports" className="py-16 md:py-20">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Simple as 1-2-3</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              No complicated steps. Just paste, wait, and know if it's safe.
            </p>
            <p className="text-sm text-muted-foreground mt-4 flex items-center justify-center gap-1">
              <span>⭐</span> Trusted by parents and teens to avoid sketchy online sites every day.
            </p>
          </motion.div>

          {/* Step Guide */}
          <StepGuide />

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mt-12">
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

      {/* Built for Real People Section */}
      <section id="about" className="py-20 md:py-24 bg-gradient-to-b from-muted/30 to-background">
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
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-6">Built for Real People</h2>

            {/* Sub-headline */}
            <p className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed">
              Because losing money to fake websites should not be part of growing up, parenting, or gift shopping.
            </p>

            {/* Body text */}
            <div className="space-y-6 text-base md:text-lg text-muted-foreground leading-relaxed mb-10">
              <p>
                We built TrustworthyCheck for everyday people who just want to shop safely. Whether you are a teen
                buying your first hoodie, a parent protecting your family, or a friend trying not to mess up a birthday
                gift, we have your back.
              </p>
              <p>
                No jargon. No confusing reports.
                <br />
                Just clear, honest answers about whether a website is safe to buy from.
              </p>
            </div>

            {/* Trust accent row */}
            <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
              <Link
                to="/save-money"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 text-primary text-sm font-medium hover:bg-primary/10 transition-colors cursor-pointer"
              >
                🛡️ Safe Shopping
              </Link>
              <Link
                to="/threats-feed"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/5 text-destructive text-sm font-medium hover:bg-destructive/10 transition-colors cursor-pointer"
              >
                🚨 Live Threat Alerts
              </Link>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/5 text-secondary text-sm font-medium">
                👨‍👩‍👧 Family Friendly
              </span>
              <Link
                to="/save-money"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/5 text-success text-sm font-medium hover:bg-success/10 transition-colors cursor-pointer"
              >
                💸 Save While You Shop
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Want Extra Protection Section */}
      <section className="py-16 md:py-20 bg-muted/30">
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
                href: "https://identityguard.y8uw.net/DGT10",
              },
              {
                icon: Lock,
                emoji: "🔐",
                title: "Password Security",
                description: "Keep your passwords secure and never get hacked.",
                button: "Secure My Passwords",
                href: "https://1password.com/",
              },
              {
                icon: Shield,
                emoji: "🛡️",
                title: "VPN Protection",
                description: "Browse anonymously and protect your data.",
                button: "Get VPN Protection",
                href: "https://nordvpn.com/",
              },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group bg-card rounded-2xl p-6 border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300"
                >
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <span className="text-3xl">{item.emoji}</span>
                  </div>
                  <h3 className="font-display font-bold text-xl mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{item.description}</p>
                  <Button asChild variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <a href={item.href} target="_blank" rel="noopener noreferrer">
                      {item.button}
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </a>
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trust Statement */}
      <section className="py-12 md:py-16 bg-background">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto"
          >
            <p className="text-lg text-muted-foreground mb-4">
              💚 We never take money to change results. Ever.{" "}
              <span className="font-medium text-foreground">Your safety comes first.</span>
            </p>
            <p className="text-sm text-muted-foreground">
              🧒 First time checking a site? Try a random shop you've seen on TikTok or Instagram.
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
      <ExtensionPrompt />
    </div>
  );
}
