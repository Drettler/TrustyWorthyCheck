import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { FeatureCard } from '@/components/FeatureCard';
import { Shield, Users, Target, Heart, ArrowRight, CheckCircle2, Search, Zap, CreditCard } from 'lucide-react';

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

export default function About() {
  const values = [
    {
      icon: Shield,
      title: 'Security First',
      description: 'We believe everyone deserves protection from online threats, regardless of technical expertise.',
    },
    {
      icon: Users,
      title: 'User-Focused',
      description: 'Our tools are designed for real people, not just security experts. Simple, clear, and actionable.',
    },
    {
      icon: Target,
      title: 'Accuracy Matters',
      description: 'We continuously improve our detection systems to minimize false positives and catch real threats.',
    },
    {
      icon: Heart,
      title: 'Free for All',
      description: 'Basic protection should be free. We offer our core website checking tool at no cost.',
    },
  ];

  const stats = [
    { value: '1M+', label: 'URLs Checked' },
    { value: '50K+', label: 'Threats Detected' },
    { value: '99.5%', label: 'Accuracy Rate' },
    { value: '24/7', label: 'Protection' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="About Us | TrustworthyCheck - Website Safety Experts"
        description="Learn about TrustworthyCheck's mission to protect people from online scams, phishing, and fraudulent websites. Free tools for everyone."
        canonical="https://trustworthycheck.com/about"
      />
      
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="container px-4 py-16 md:py-24">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Shield className="w-4 h-4" />
              About TrustworthyCheck
            </div>
            
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-6">
              Protecting People from <span className="text-primary">Online Threats</span>
            </h1>
            
            <p className="text-lg text-muted-foreground leading-relaxed">
              We started TrustworthyCheck with a simple mission: help everyday people stay safe online. 
              With scams becoming more sophisticated every day, we provide free, easy-to-use tools 
              that anyone can use to verify if a website is legitimate.
            </p>
          </motion.div>
        </section>

        {/* Stats Section */}
        <section className="bg-card border-y border-border">
          <div className="container px-4 py-12">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8"
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <p className="text-3xl md:text-4xl font-display font-bold text-primary">{stat.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Our Values */}
        <section className="container px-4 py-16 md:py-24">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center max-w-2xl mx-auto mb-12"
          >
            <h2 className="text-3xl font-display font-bold mb-4">Our Values</h2>
            <p className="text-muted-foreground">
              These principles guide everything we do at TrustworthyCheck.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="p-6 rounded-2xl bg-card border border-border"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <value.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{value.title}</h3>
                <p className="text-muted-foreground text-sm">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* How We Help Section */}
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

        {/* What We Do */}
        <section className="bg-background">
          <div className="container px-4 py-16 md:py-24">
            <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-3xl font-display font-bold mb-6">What We Do</h2>
                <div className="space-y-4">
                  {[
                    'Analyze websites for scam indicators and red flags',
                    'Check domain age, SSL status, and reputation',
                    'Cross-reference with known threat databases',
                    'Provide clear, actionable safety recommendations',
                    'Track and report emerging online threats',
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-card p-8 rounded-2xl border border-border"
              >
                <h3 className="text-xl font-semibold mb-4">Ready to Check a Website?</h3>
                <p className="text-muted-foreground mb-6">
                  Use our free tool to instantly verify if any website is safe to visit or buy from.
                </p>
                <Button variant="hero" asChild>
                  <Link to="/website-checker">
                    Check a Website
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
