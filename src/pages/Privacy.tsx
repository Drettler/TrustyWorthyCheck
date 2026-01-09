import { motion } from 'framer-motion';
import { ArrowLeft, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';

export default function Privacy() {
  const sections = [
    {
      title: 'Information We Collect',
      content: 'We collect basic usage data including pages visited, device type, and IP address. We also collect URLs you submit for safety analysis.',
    },
    {
      title: 'How We Use It',
      items: [
        'Improve site accuracy and safety tools',
        'Provide savings and safety features',
        'Analyze site performance',
      ],
    },
    {
      title: 'What We Do Not Do',
      items: [
        'We do not sell personal data',
        'We do not collect sensitive personal information from minors',
      ],
    },
    {
      title: 'Cookies & Tracking',
      content: 'Cookies are used for analytics, performance, and affiliate tracking to help us understand how users interact with our site and to support our partners.',
    },
    {
      title: "Children's Privacy",
      content: 'We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child, please contact us.',
    },
    {
      title: 'Third Party Services',
      content: 'Affiliate partners and analytics providers may use cookies or tracking technologies. We encourage you to review the privacy policies of any third-party services you interact with through our site.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <SEO 
        title="Privacy Policy"
        description="Learn how TrustworthyCheck collects, uses, and protects your data. We prioritize your privacy and do not sell personal information."
        canonical="https://trustworthycheck.com/privacy"
      />
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
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
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
                      <span className="text-primary mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          ))}
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
