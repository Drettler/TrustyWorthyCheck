import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Search,
  DollarSign,
  CheckCircle,
  Heart,
  Gift,
  Store,
  Zap,
  HelpCircle,
  ExternalLink,
  Users,
  Star,
  Quote,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function SaveMoney() {
  const [showInterstitial, setShowInterstitial] = useState(false);
  const [showStickyCTA, setShowStickyCTA] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky CTA after scrolling past hero section
      setShowStickyCTA(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleActivateClick = () => {
    setShowInterstitial(true);

    setTimeout(() => {
      window.open("http://www.mrrebates.com?refid=918226", "_blank", "noopener,noreferrer");
    }, 500);

    setTimeout(() => {
      setShowInterstitial(false);
    }, 3000);
  };

  const trustChips = [
    { icon: Gift, text: "Free to join" },
    { icon: Store, text: "Works at 5,000+ stores" },
    { icon: Shield, text: "No impact on safety verdicts" },
  ];

  const testimonials = [
    {
      quote: "I saved $47 on my first order! Can't believe I wasn't using this before.",
      name: "Sarah M.",
      location: "Texas",
    },
    {
      quote: "Finally a cashback site that actually pays out. Been using it for 6 months now.",
      name: "Mike R.",
      location: "California",
    },
    {
      quote: "Love that TrustworthyCheck checks if a site is safe first. Peace of mind + savings!",
      name: "Jessica T.",
      location: "New York",
    },
  ];

  const faqItems = [
    {
      question: "How does cashback work?",
      answer:
        "When you shop through Mr. Rebates, they receive a commission from the store. They share a portion of that commission with you as cashback. Your prices stay the same — you just earn money back.",
    },
    {
      question: "Which stores are supported?",
      answer:
        "Mr. Rebates works with over 5,000 retailers including Walmart, Target, Macy's, Best Buy, Expedia, Nike, and many more popular stores.",
    },
    {
      question: "How long does it take to get paid?",
      answer:
        "Cashback is typically credited to your account within 24-48 hours after your purchase. Once you reach the minimum payout threshold, you can request a payment via check or PayPal.",
    },
    {
      question: "Why do you recommend Mr. Rebates?",
      answer:
        "They've been operating for over 20 years and have paid out millions to members. They have secure tracking, verified payouts, and no fees to join.",
    },
    {
      question: "Does this affect your safety ratings?",
      answer:
        "Absolutely not. Our safety verdicts are 100% independent. We never change a website's trust score based on affiliate partnerships.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Save Money While Shopping Online"
        description="Earn cashback and find coupons while shopping at trusted online stores. Check website safety first, then save money on every purchase."
        canonical="https://trustworthycheck.com/save-money"
      />
      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />

          <div className="container px-4 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-3xl mx-auto"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6 leading-tight">
                Save Money While You Shop {""}
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Without Getting Scammed
                </span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8 max-w-2xl mx-auto">
                We verify stores first. Then we help you earn cashback at the safe ones.
              </p>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="flex flex-col items-center"
              >
                {/* Social Proof Badge */}
                <div className="flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-muted/80 border">
                  <div className="flex -space-x-2">
                    <div className="w-6 h-6 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center">
                      <Users className="w-3 h-3 text-primary" />
                    </div>
                    <div className="w-6 h-6 rounded-full bg-secondary/20 border-2 border-background" />
                    <div className="w-6 h-6 rounded-full bg-primary/30 border-2 border-background" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Join <span className="text-foreground font-semibold">10,000+</span> smart shoppers
                  </span>
                </div>

                <Button
                  variant="hero"
                  size="lg"
                  className="gap-2 text-lg px-10 py-7 shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-shadow"
                  onClick={handleActivateClick}
                >
                  <DollarSign className="w-6 h-6" />
                  Activate Cashback Now
                  <ExternalLink className="w-4 h-4 opacity-70" />
                </Button>
                <p className="text-sm text-muted-foreground mt-4">Free. Takes under 60 seconds.</p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* How It Works - Visual Steps */}
        <section className="py-16 bg-muted/30">
          <div className="container px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-2xl md:text-3xl font-display font-bold mb-2">How It Works</h2>
              <p className="text-muted-foreground">Three simple steps to start earning</p>
            </motion.div>

            <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-4 max-w-4xl mx-auto mb-12">
              {/* Step 1: Check */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="flex flex-col items-center text-center flex-1"
              >
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mb-4 shadow-lg">
                  <Search className="w-10 h-10 text-primary-foreground" />
                </div>
                <span className="text-sm font-semibold text-primary uppercase tracking-wide mb-1">Step 1</span>
                <h3 className="text-xl font-bold mb-2">Check</h3>
                <p className="text-sm text-muted-foreground max-w-[180px]">
                  Verify the store is safe on TrustworthyCheck
                </p>
              </motion.div>

              {/* Arrow */}
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="hidden md:flex items-center text-muted-foreground/50"
              >
                <Zap className="w-8 h-8" />
              </motion.div>

              {/* Step 2: Activate */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="flex flex-col items-center text-center flex-1"
              >
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-secondary to-secondary/80 flex items-center justify-center mb-4 shadow-lg">
                  <CheckCircle className="w-10 h-10 text-secondary-foreground" />
                </div>
                <span className="text-sm font-semibold text-secondary uppercase tracking-wide mb-1">Step 2</span>
                <h3 className="text-xl font-bold mb-2">Activate</h3>
                <p className="text-sm text-muted-foreground max-w-[180px]">Click through to activate your cashback</p>
              </motion.div>

              {/* Arrow */}
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="hidden md:flex items-center text-muted-foreground/50"
              >
                <Zap className="w-8 h-8" />
              </motion.div>

              {/* Step 3: Earn */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="flex flex-col items-center text-center flex-1"
              >
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4 shadow-lg">
                  <DollarSign className="w-10 h-10 text-white" />
                </div>
                <span className="text-sm font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent uppercase tracking-wide mb-1">
                  Step 3
                </span>
                <h3 className="text-xl font-bold mb-2">Earn</h3>
                <p className="text-sm text-muted-foreground max-w-[180px]">Shop & get money back automatically</p>
              </motion.div>
            </div>

            {/* Secondary CTA */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="text-center"
            >
              <Button variant="hero" size="lg" className="gap-2 px-8" onClick={handleActivateClick}>
                <DollarSign className="w-5 h-5" />
                Activate Cashback Now
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16">
          <div className="container px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <div className="inline-flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                ))}
              </div>
              <h2 className="text-2xl md:text-3xl font-display font-bold mb-2">Loved by Smart Shoppers</h2>
              <p className="text-muted-foreground">See what others are saying</p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full bg-background/50 hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <Quote className="w-8 h-8 text-primary/20 mb-3" />
                      <p className="text-foreground mb-4 leading-relaxed">"{testimonial.quote}"</p>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">{testimonial.name.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">{testimonial.name}</p>
                          <p className="text-xs text-muted-foreground">{testimonial.location}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Cashback Partner Section - Merged */}
        <section className="py-16 md:py-20">
          <div className="container px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-2xl mx-auto"
            >
              <Card className="overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-secondary/5 shadow-xl">
                <CardContent className="p-8 md:p-12">
                  <div className="text-center">
                    {/* Icon */}
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ type: "spring", stiffness: 200 }}
                      className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-primary/30"
                    >
                      <DollarSign className="w-12 h-12 text-white" />
                    </motion.div>

                    {/* Title */}
                    <h2 className="text-2xl md:text-3xl font-display font-bold mb-4">
                      Our Cashback Partner: Mr. Rebates
                    </h2>

                    {/* Description */}
                    <p className="text-muted-foreground leading-relaxed mb-8 max-w-lg mx-auto">
                      Mr. Rebates has been helping shoppers earn cashback for over 20 years. Join for free and start
                      earning at 5,000+ trusted stores including Walmart, Target, Best Buy, and Nike.
                    </p>

                    {/* Primary CTA */}
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        variant="hero"
                        size="lg"
                        className="gap-2 text-lg px-10 py-7 shadow-xl shadow-primary/20 mb-6"
                        onClick={handleActivateClick}
                      >
                        <DollarSign className="w-6 h-6" />
                        Activate Cashback
                        <ExternalLink className="w-4 h-4 opacity-70" />
                      </Button>
                    </motion.div>

                    {/* Trust Chips */}
                    <div className="flex flex-wrap justify-center gap-3">
                      {trustChips.map((chip, index) => (
                        <motion.div
                          key={chip.text}
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.1 * index }}
                          className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border text-sm font-medium"
                        >
                          <chip.icon className="w-4 h-4 text-primary" />
                          {chip.text}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-muted/30">
          <div className="container px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-muted-foreground mb-4">
                <HelpCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Questions?</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-display font-bold">Frequently Asked Questions</h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-2xl mx-auto"
            >
              <Accordion type="single" collapsible className="space-y-3">
                {faqItems.map((item, index) => (
                  <AccordionItem
                    key={index}
                    value={`item-${index}`}
                    className="bg-background rounded-xl border px-6 data-[state=open]:shadow-md transition-shadow"
                  >
                    <AccordionTrigger className="text-left font-semibold hover:no-underline py-5">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-5">{item.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          </div>
        </section>

        {/* Affiliate Disclosure */}
        <section className="py-12">
          <div className="container px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto"
            >
              <Card className="bg-muted/50 border-dashed">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      <Heart className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Affiliate Disclosure</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        TrustworthyCheck may earn a small commission when you use our partner links. This never affects
                        your price and helps support the operation of our site. We only recommend services we believe
                        provide genuine value to consumers.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Interstitial Overlay */}
      <AnimatePresence>
        {showInterstitial && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card rounded-2xl p-8 shadow-2xl border text-center max-w-sm mx-4"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-white animate-pulse" />
              </div>
              <h3 className="text-xl font-bold mb-2">Sending you to Mr. Rebates securely…</h3>
              <p className="text-muted-foreground">Finish signup to lock in cashback.</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
            <div className="bg-background/95 backdrop-blur-lg border-t shadow-[0_-4px_20px_rgba(0,0,0,0.1)] px-4 py-3 safe-bottom">
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">Ready to save?</p>
                  <p className="text-xs text-muted-foreground">Free cashback at 5,000+ stores</p>
                </div>
                <Button
                  variant="hero"
                  size="sm"
                  className="gap-1.5 flex-shrink-0 shadow-lg"
                  onClick={handleActivateClick}
                >
                  <DollarSign className="w-4 h-4" />
                  Activate
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
