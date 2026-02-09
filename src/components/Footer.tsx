import { Shield, Mail } from 'lucide-react';

export function Footer() {
  const mainLinks = [
    { label: 'Website Checker', href: '/website-checker' },
    { label: 'Save Money', href: '/save-money' },
    { label: 'Protect Yourself', href: '/protect-yourself' },
  ];

  const legalLinks = [
    { label: 'Privacy', href: '/privacy' },
    { label: 'Terms', href: '/terms' },
    { label: 'Disclosure', href: '/disclosure' },
    { label: 'Disclaimer', href: '/disclaimer' },
  ];

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container px-4 py-8">
        <div className="flex flex-col gap-8">
          {/* Top row: Logo + Main links */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-semibold">TrustWorthyCheck</span>
            </div>

            {/* Main Links */}
            <nav className="flex flex-wrap items-center justify-center gap-6">
              {mainLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Contact */}
            <a 
              href="mailto:support@trustworthycheck.com"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Mail className="w-4 h-4" />
              support@trustworthycheck.com
            </a>
          </div>

          {/* Bottom row: Legal links + Copyright */}
          <div className="pt-6 border-t border-border/50">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Legal Links */}
              <nav className="flex flex-wrap items-center justify-center gap-4">
                {legalLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>

              {/* Copyright */}
              <div className="text-center md:text-right">
                <p className="text-xs text-muted-foreground">
                  Educational guidance only — not legal advice.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  © {new Date().getFullYear()} TrustWorthyCheck. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
