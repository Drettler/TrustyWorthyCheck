import { motion } from 'framer-motion';

const steps = [
  {
    number: '①',
    emoji: '🔗',
    title: 'Paste a link',
    description: 'Copy the website URL you want to check',
  },
  {
    number: '②',
    emoji: '🔍',
    title: 'We scan for red flags',
    description: 'Our system analyzes security & trust signals',
  },
  {
    number: '③',
    emoji: '🧾',
    title: 'Get a clear verdict',
    description: 'Easy-to-understand safety assessment',
  },
];

export function StepGuide() {
  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 mt-8">
      {steps.map((step, index) => (
        <motion.div
          key={step.number}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 + index * 0.1 }}
          className="flex items-center gap-3"
        >
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border/60 shadow-sm">
            <span className="text-lg font-bold text-primary">{step.number}</span>
            <span className="text-xl">{step.emoji}</span>
            <span className="text-sm font-medium text-foreground">{step.title}</span>
          </div>
          
          {/* Connector arrow (hidden on mobile, hidden on last item) */}
          {index < steps.length - 1 && (
            <div className="hidden md:block text-muted-foreground/40 text-xl">→</div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
