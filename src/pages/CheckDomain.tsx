import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, CheckCircle, AlertTriangle, Search, ArrowRight, Globe, Clock, Users, FileText } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// Loose validation — matches isValidUrl in UrlChecker, host-only
function isValidDomain(d: string): boolean {
  if (!d || d.length > 253) return false;
  if (/\s/.test(d)) return false;
  return /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(d);
}

export default function CheckDomain() {
  const { domain: rawDomain } = useParams<{ domain: string }>();
  const domain = (rawDomain || '').toLowerCase().replace(/^www\./, '').replace(/\/+$/, '');

  if (!isValidDomain(domain)) {
    return <Navigate to="/" replace />;
  }

  const checkHref = `/?check=${encodeURIComponent(domain)}#checker`;
  const canonical = `https://trustworthycheck.com/check/${domain}`;
  const title = `Is ${domain} safe? Trust score & scam check`;
  const description = `Run a free safety check on ${domain}. See trust score, SSL, domain age, scam reports, and red flags in under a minute.`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `Is ${domain} safe to use?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Run a free check on ${domain} with TrustworthyCheck to see its trust score, SSL status, domain age, and any community-reported scam flags. Results take under a minute.`,
        },
      },
      {
        '@type': 'Question',
        name: `Is ${domain} a scam?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `TrustworthyCheck cross-references ${domain} against threat feeds from the FTC, IC3, and community reports. Use the safety check above to see the latest verdict.`,
        },
      },
      {
        '@type': 'Question',
        name: `How do I know if ${domain} is legit?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Check the domain's age, SSL certificate, contact details, customer reviews, and whether it appears in known scam databases. TrustworthyCheck runs all these checks automatically.`,
        },
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title={title} description={description} canonical={canonical} jsonLd={jsonLd} />
      <Header />

      <main className="container px-4 py-12 md:py-16">
        {/* Breadcrumb */}
        <nav className="text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-primary">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/website-checker" className="hover:text-primary">Website Checker</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{domain}</span>
        </nav>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Shield className="w-4 h-4" />
            Free Safety Check
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Is <span className="text-primary break-all">{domain}</span> safe?
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Run a free, instant trust check on <strong>{domain}</strong>. We scan SSL,
            domain age, business signals, scam reports, and red flags — no signup required.
          </p>

          <Button asChild size="lg" className="h-14 px-8 text-lg font-bold rounded-xl bg-gradient-to-r from-primary to-secondary hover:opacity-90 shadow-lg">
            <Link to={checkHref}>
              <Search className="w-5 h-5 mr-2" />
              Check {domain} now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
          <p className="text-xs text-muted-foreground mt-3">
            Results in under 60 seconds · 100% free · No account needed
          </p>
        </motion.div>

        {/* What we check */}
        <div className="max-w-4xl mx-auto mb-12">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-center mb-6">
            What we check on {domain}
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: Globe, title: 'Domain & WHOIS', desc: 'How old the site is and who registered it.' },
              { icon: Shield, title: 'SSL Certificate', desc: 'Whether the connection is encrypted and trusted.' },
              { icon: AlertTriangle, title: 'Scam Reports', desc: 'Reports from FTC, IC3, and our community.' },
              { icon: Users, title: 'Reviews & Reputation', desc: 'What real customers are saying.' },
              { icon: FileText, title: 'Business Registration', desc: 'Contact info, address, and legal signals.' },
              { icon: CheckCircle, title: 'Payment Safety', desc: 'Trusted gateways vs risky payment methods.' },
            ].map((item) => (
              <Card key={item.title} className="p-5 flex gap-4 items-start">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto mb-12">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-center mb-6">
            Frequently asked about {domain}
          </h2>
          <div className="space-y-4">
            {[
              {
                q: `Is ${domain} a scam?`,
                a: `We check ${domain} against scam databases including the FTC, IC3, and community-reported flags. Run the check above to see the latest result — verdicts change as new reports come in.`,
              },
              {
                q: `How do I know if ${domain} is legit?`,
                a: `Legitimate sites usually have an established domain age, valid SSL, a real business address, working contact info, and consistent positive reviews. Our checker scores all of these automatically.`,
              },
              {
                q: `Is it safe to enter my credit card on ${domain}?`,
                a: `Never enter payment details on a site you can't verify. Run a check on ${domain} first, look for HTTPS in the address bar, and prefer trusted gateways like Stripe, PayPal, or Apple Pay over wire transfers or crypto.`,
              },
              {
                q: `What should I do if ${domain} looks suspicious?`,
                a: `Don't enter personal or payment info. Report the site through our reporting tool, and warn friends and family. If you already paid, contact your bank or card issuer immediately.`,
              },
            ].map((item) => (
              <Card key={item.q} className="p-6">
                <h3 className="font-semibold text-lg mb-2 flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  {item.q}
                </h3>
                <p className="text-muted-foreground leading-relaxed pl-5">{item.a}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-8 border-2 border-primary/20"
        >
          <Clock className="w-10 h-10 text-primary mx-auto mb-3" />
          <h2 className="text-2xl font-display font-bold mb-2">Ready to check {domain}?</h2>
          <p className="text-muted-foreground mb-6">
            Get your trust score in under a minute. Free, no signup.
          </p>
          <Button asChild size="lg" className="h-12 px-8 text-base font-bold rounded-xl">
            <Link to={checkHref}>
              <Shield className="w-5 h-5 mr-2" />
              Run safety check
            </Link>
          </Button>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
