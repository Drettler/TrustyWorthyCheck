import { motion } from 'framer-motion';
import { Shield, Search, MousePointerClick, ShoppingBag, Clock, Users, Lock, DollarSign, CheckCircle, Heart } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function SaveMoney() {
  const steps = [
    {
      icon: Search,
      title: 'Check the Store',
      description: 'Search any website on TrustworthyCheck to make sure it\'s safe and legitimate.',
    },
    {
      icon: MousePointerClick,
      title: 'Activate Your Savings',
      description: 'Before purchasing, click our partner savings button to activate cashback and coupons.',
    },
    {
      icon: ShoppingBag,
      title: 'Shop & Save',
      description: 'Complete your purchase and earn money back automatically.',
    },
  ];

  const trustReasons = [
    { icon: Clock, text: 'Operating for over 20 years' },
    { icon: Users, text: 'Millions paid out to members' },
    { icon: Lock, text: 'Secure tracking & verified payouts' },
    { icon: DollarSign, text: 'No fees to join' },
    { icon: CheckCircle, text: 'Works with stores you already shop at' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        {/* Hero Section - Why This Exists */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
          
          <div className="container px-4 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
                <Shield className="w-4 h-4" />
                <span className="text-sm font-medium">Safe Shopping + Savings</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6">
                Shop Safely.{' '}
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Save Automatically.
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                We don't just tell you whether a store is legitimate — we also help you keep more of your money when you shop there.
              </p>
              
              <p className="text-md text-muted-foreground mt-4">
                When you click through our partner savings service, you can earn cashback or discounts at hundreds of major retailers.
              </p>
            </motion.div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 bg-muted/30">
          <div className="container px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                How It Works
              </h2>
              <p className="text-muted-foreground">Simple 3 Steps to Start Saving</p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {steps.map((step, index) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full text-center relative overflow-hidden">
                    <div className="absolute top-4 left-4 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">{index + 1}</span>
                    </div>
                    <CardContent className="pt-12 pb-6">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                        <step.icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                      <p className="text-muted-foreground">{step.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Savings Partner Section */}
        <section className="py-16">
          <div className="container px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-8"
            >
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                Our Recommended Savings Partner
              </h2>
              <p className="text-muted-foreground">Mr. Rebates</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="max-w-2xl mx-auto"
            >
              <Card className="overflow-hidden border-2 border-primary/20">
                <CardContent className="p-8 text-center">
                  <a 
                    href="http://www.mrrebates.com?refid=918226" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block mb-6"
                  >
                    <Button variant="hero" size="lg" className="gap-2 text-lg px-8 py-6">
                      <DollarSign className="w-5 h-5" />
                      Activate Cashback Now
                    </Button>
                  </a>
                  
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Mr. Rebates provides cashback and exclusive deals at over 5,000 trusted online retailers including Walmart, Target, Macy's, Best Buy, Expedia, Nike, and more.
                  </p>
                  
                  <p className="text-sm text-primary font-medium">
                    Joining is free and takes under 60 seconds.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Why We Trust Them Section */}
        <section className="py-16 bg-muted/30">
          <div className="container px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                Why We Recommend Mr. Rebates
              </h2>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {trustReasons.map((reason, index) => (
                <motion.div
                  key={reason.text}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-3 p-4 rounded-xl bg-background border"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <reason.icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="font-medium">{reason.text}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Affiliate Disclosure Section */}
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
                        TrustworthyCheck may earn a small commission when you use our partner links. This never affects your price and helps support the operation of our site. We only recommend services we believe provide genuine value to consumers.
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
    </div>
  );
}
