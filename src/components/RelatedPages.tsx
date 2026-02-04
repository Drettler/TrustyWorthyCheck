import { motion } from 'framer-motion';
import { DollarSign, Shield, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface RelatedPage {
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
  color: string;
  emoji: string;
}

const allPages: Record<string, RelatedPage> = {
  'save-money': {
    title: 'Save Money',
    description: 'Earn cashback at verified safe stores while you shop online.',
    href: '/save-money',
    icon: DollarSign,
    color: 'from-emerald-500 to-teal-500',
    emoji: '💰',
  },
  'protect-yourself': {
    title: 'Protect Yourself',
    description: 'Identity protection, password security, and payment safety tools.',
    href: '/protect-yourself',
    icon: Shield,
    color: 'from-blue-500 to-cyan-500',
    emoji: '🛡️',
  },
};

interface RelatedPagesProps {
  currentPage: 'save-money' | 'protect-yourself';
}

export function RelatedPages({ currentPage }: RelatedPagesProps) {
  // Filter out the current page
  const relatedPages = Object.entries(allPages)
    .filter(([key]) => key !== currentPage)
    .map(([, page]) => page);

  return (
    <section className="py-16 border-t border-border/50">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl md:text-3xl font-display font-bold mb-2">
            Also Check Out
          </h2>
          <p className="text-muted-foreground">
            More ways to stay safe online
          </p>
        </motion.div>

        <div className="max-w-2xl mx-auto">
          {relatedPages.map((page, index) => (
            <motion.div
              key={page.href}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={page.href}
                className="group flex items-center gap-4 p-6 rounded-2xl bg-card border-2 border-border hover:border-primary/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                {/* Icon */}
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${page.color} flex items-center justify-center shadow-lg shrink-0 group-hover:scale-110 transition-transform`}>
                  <span className="text-3xl">{page.emoji}</span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-bold text-xl mb-1 group-hover:text-primary transition-colors">
                    {page.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {page.description}
                  </p>
                </div>

                {/* Arrow */}
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
