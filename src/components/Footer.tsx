import { Shield } from 'lucide-react';

export function Footer() {
  const footerLinks = [
    { label: 'Privacy', href: '#privacy' },
    { label: 'Terms', href: '#terms' },
    { label: 'Disclosure', href: '#disclosure' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-semibold">TrustWorthy Check</span>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap items-center justify-center gap-6">
            {footerLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 pt-6 border-t border-border/50 text-center">
          <p className="text-xs text-muted-foreground">
            Educational guidance only — not legal advice.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            © {new Date().getFullYear()} TrustWorthy Check. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
