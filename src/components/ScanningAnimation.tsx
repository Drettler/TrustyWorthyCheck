import { motion } from 'framer-motion';
import { Shield, Search, Database, Brain } from 'lucide-react';

const stages = [
  { icon: Search, label: 'Scanning website...' },
  { icon: Database, label: 'Analyzing content...' },
  { icon: Brain, label: 'AI evaluation...' },
  { icon: Shield, label: 'Generating report...' },
];

interface ScanningAnimationProps {
  currentStage?: number;
}

export function ScanningAnimation({ currentStage = 0 }: ScanningAnimationProps) {
  return (
    <div className="flex flex-col items-center py-12">
      {/* Central pulsing icon */}
      <div className="relative mb-8">
        <motion.div
          className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Shield className="w-12 h-12 text-primary" />
        </motion.div>
        
        {/* Orbiting ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-primary/30"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute -inset-4 rounded-full border border-primary/20"
          animate={{ rotate: -360 }}
          transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Stage indicators */}
      <div className="flex gap-6 mb-6">
        {stages.map((stage, index) => {
          const Icon = stage.icon;
          const isActive = index <= currentStage;
          const isCurrent = index === currentStage;
          
          return (
            <motion.div
              key={index}
              className={`flex flex-col items-center gap-2 ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
            >
              <motion.div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isActive ? 'bg-primary/20' : 'bg-muted'
                }`}
                animate={isCurrent ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <Icon className="w-5 h-5" />
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* Current stage label */}
      <motion.p
        key={currentStage}
        className="text-lg font-medium text-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {stages[currentStage]?.label}
      </motion.p>
      
      <p className="text-sm text-muted-foreground mt-2">
        This may take a few seconds...
      </p>
    </div>
  );
}
