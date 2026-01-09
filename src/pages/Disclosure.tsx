import { motion } from 'framer-motion';
import { ArrowLeft, DollarSign, Heart, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function Disclosure() {
  const sections = [
    {
      title: 'How We Keep This Site Free',
      content: 'TrustworthyCheck is free to use because we participate in affiliate programs with trusted partners. When you click on certain links and make a purchase, we may earn a small commission at no extra cost to you.',
      icon: Heart,
    },
    {
      title: 'Affiliate Relationships',
      content: 'We partner with cashback services, shopping platforms, and other trusted providers. These partnerships help us maintain and improve our safety tools while offering you additional savings opportunities.',
      icon: DollarSign,
    },
    {
      title: 'Our Commitment to You',
      items: [
        'Our safety analysis is independent and never influenced by affiliate relationships',
        'We only partner with services we believe provide genuine value',
        'Affiliate links are clearly presented alongside non-affiliate resources',
        'Your trust and safety always come first',
      ],
    },
    {
      title: 'What This Means for You',
      content: 'When you use our recommended cashback services or click on partner links, you may help support TrustworthyCheck while potentially saving money on your purchases. You never pay more — in fact, you often pay less.',
    },
    {
      title: 'Third-Party Services',
      content: 'We link to external websites and services. While we vet our partners, we cannot guarantee their content, privacy practices, or services. We encourage you to review their terms before engaging.',
    },
    {
      title: 'Questions?',
      content: 'If you have questions about our affiliate relationships or how we generate revenue, we believe in transparency. Our goal is to help you stay safe online while keeping our tools free and accessible.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-success/10 mb-4">
            <DollarSign className="w-8 h-8 text-success" />
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
            Affiliate Disclosure
          </h1>
          <p className="text-muted-foreground">
            Transparency about how we support this free service
          </p>
        </motion.div>

        {/* Highlight Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-8 p-6 rounded-xl bg-primary/5 border-2 border-primary/20"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Heart className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Our Promise</h3>
              <p className="text-muted-foreground">
                Your safety is our priority. Our website analysis and trust scores are never influenced by affiliate partnerships. We recommend tools and services because they're genuinely helpful — not because we earn from them.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          {sections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="p-6 rounded-xl bg-card border border-border"
            >
              <h2 className="font-display text-lg font-semibold mb-3">{section.title}</h2>
              {section.content && (
                <p className="text-muted-foreground leading-relaxed">{section.content}</p>
              )}
              {section.items && (
                <ul className="space-y-2">
                  {section.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-muted-foreground">
                      <span className="text-success mt-1">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* FTC Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 p-4 rounded-lg bg-muted/50 text-center"
        >
          <p className="text-xs text-muted-foreground">
            This disclosure is provided in accordance with the Federal Trade Commission's guidelines on endorsements and testimonials.
          </p>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
