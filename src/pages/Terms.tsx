import { motion } from 'framer-motion';
import { ArrowLeft, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';

export default function Terms() {
  const sections = [
    {
      title: 'What We Do',
      content: 'TrustworthyCheck provides website trust information, safety insights, scam alerts, and shopping resources. We provide informational content and tools to help users make safer decisions online. We do not guarantee the safety, accuracy, or outcome of any transaction.',
    },
    {
      title: 'User Responsibility',
      content: 'Users are responsible for their own actions, purchases, and decisions.',
    },
    {
      title: 'No Warranties',
      content: 'Our services are provided "as is" without guarantees of accuracy, completeness, or reliability.',
    },
    {
      title: 'Limitation of Liability',
      content: 'TrustworthyCheck is not responsible for losses, damages, or issues arising from use of the site, third party websites, or purchases.',
    },
    {
      title: 'Third Party Services',
      content: 'We link to external sites including merchants and savings partners. We are not responsible for their content, privacy practices, or services.',
    },
    {
      title: 'Changes',
      content: 'We may update these Terms at any time. Continued use of the site constitutes acceptance of any changes.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <SEO 
        title="Terms of Service"
        description="Read TrustworthyCheck's terms of service. Understand your responsibilities and our limitations when using our website safety tools."
        canonical="https://trustworthycheck.com/terms"
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
            <FileText className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
            Terms of Service
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
              <p className="text-muted-foreground leading-relaxed">{section.content}</p>
            </motion.div>
          ))}
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
