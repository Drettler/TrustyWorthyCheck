import { motion } from 'framer-motion';

interface TrustScoreGaugeProps {
  score: number;
  verdict: 'safe' | 'caution' | 'danger';
}

export function TrustScoreGauge({ score, verdict }: TrustScoreGaugeProps) {
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  
  const getVerdictColor = () => {
    switch (verdict) {
      case 'safe': return 'text-success';
      case 'caution': return 'text-warning';
      case 'danger': return 'text-danger';
    }
  };

  const getStrokeColor = () => {
    switch (verdict) {
      case 'safe': return 'stroke-success';
      case 'caution': return 'stroke-warning';
      case 'danger': return 'stroke-danger';
    }
  };

  const getGlowClass = () => {
    switch (verdict) {
      case 'safe': return 'drop-shadow-[0_0_20px_hsl(160,84%,39%,0.5)]';
      case 'caution': return 'drop-shadow-[0_0_20px_hsl(38,92%,50%,0.5)]';
      case 'danger': return 'drop-shadow-[0_0_20px_hsl(0,84%,60%,0.5)]';
    }
  };

  const getVerdictLabel = () => {
    switch (verdict) {
      case 'safe': return 'LEGIT';
      case 'caution': return 'CAUTION';
      case 'danger': return 'SCAM';
    }
  };

  return (
    <motion.div 
      className="relative flex flex-col items-center"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className={`relative ${getGlowClass()}`}>
        <svg className="w-40 h-40 -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="8"
            strokeLinecap="round"
          />
          {/* Progress circle */}
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            className={getStrokeColor()}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
          />
        </svg>
        
        {/* Score text in center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span 
            className={`text-4xl font-display font-bold ${getVerdictColor()}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {score}
          </motion.span>
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            Trust Score
          </span>
        </div>
      </div>
      
      {/* Verdict badge */}
      <motion.div
        className={`mt-4 px-4 py-1.5 rounded-full font-semibold text-sm uppercase tracking-wider ${
          verdict === 'safe' ? 'bg-success/20 text-success' :
          verdict === 'caution' ? 'bg-warning/20 text-warning' :
          'bg-danger/20 text-danger'
        }`}
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        {getVerdictLabel()}
      </motion.div>
    </motion.div>
  );
}
