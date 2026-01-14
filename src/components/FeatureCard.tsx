import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FeatureCardProps {
  icon: LucideIcon;
  emoji: string;
  title: string;
  description: string;
  index: number;
  link?: string;
}

export function FeatureCard({ icon: Icon, emoji, title, description, index, link }: FeatureCardProps) {
  const CardWrapper = link ? Link : 'div';
  const cardProps = link ? { to: link } : {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="group"
    >
      <CardWrapper 
        {...cardProps as any}
        className="block relative bg-card rounded-3xl p-8 border-2 border-border/60 shadow-lg hover:shadow-2xl hover:border-primary/30 transition-all duration-300"
      >
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <div className="relative">
          {/* Icon with emoji */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <span className="text-3xl">{emoji}</span>
          </div>

          <h3 className="font-display font-bold text-xl mb-3 text-foreground">
            {title}
          </h3>

          <p className="text-muted-foreground leading-relaxed">
            {description}
          </p>

          {link && (
            <span className="inline-flex items-center gap-1 mt-3 text-sm text-primary font-medium group-hover:underline">
              Learn more →
            </span>
          )}
        </div>
      </CardWrapper>
    </motion.div>
  );
}
