import { motion } from 'framer-motion';
import { Shield, Search, Database, Brain, Lock, Globe, FileText } from 'lucide-react';

const automatedChecks = [
  { icon: Lock, label: 'HTTPS/SSL Verification', status: 'live' as const },
  { icon: Globe, label: 'Domain Analysis', status: 'live' as const },
  { icon: Shield, label: 'Security Warnings Check', status: 'live' as const },
  { icon: FileText, label: 'Red Flag Detection', status: 'live' as const },
];

const stages = [
  { icon: Search, label: 'Fetching website data...' },
  { icon: Database, label: 'Running automated checks...' },
  { icon: Brain, label: 'Analyzing transparency indicators...' },
  { icon: Shield, label: 'Preparing assessment...' },
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
      
      <p className="text-sm text-muted-foreground mt-2 mb-6">
        This may take a few seconds...
      </p>

      {/* Automated Checks List */}
      <div className="w-full max-w-md bg-muted/30 rounded-xl p-4 border border-border/50">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
          Automated Checks Running
        </p>
        <div className="space-y-2">
          {automatedChecks.map((check, index) => {
            const Icon = check.icon;
            const isComplete = currentStage > index;
            
            return (
              <motion.div
                key={check.label}
                className="flex items-center gap-3 text-sm"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.15 }}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  isComplete ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                }`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className={isComplete ? 'text-foreground' : 'text-muted-foreground'}>
                  {check.label}
                </span>
                <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  ✓ Live
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
