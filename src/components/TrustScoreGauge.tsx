import { motion } from 'framer-motion';
import { ShieldCheck, ShieldAlert, ShieldX, Check } from 'lucide-react';

interface TrustScoreGaugeProps {
  score: number;
  verdict: 'safe' | 'caution' | 'danger';
  redFlagsCount?: number;
}

export function TrustScoreGauge({ score, verdict, redFlagsCount = 0 }: TrustScoreGaugeProps) {
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const isTrustworthy = score >= 75;
  
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

  const getVerdictLabel = () => {
    switch (verdict) {
      case 'safe': return 'Trustworthy';
      case 'caution': return 'Exercise Caution';
      case 'danger': return 'High Risk';
    }
  };

  const getVerdictIcon = () => {
    switch (verdict) {
      case 'safe': return <ShieldCheck className="w-5 h-5" />;
      case 'caution': return <ShieldAlert className="w-5 h-5" />;
      case 'danger': return <ShieldX className="w-5 h-5" />;
    }
  };

  const getVerdictDescription = () => {
    switch (verdict) {
      case 'safe': return 'This website shows positive trust indicators';
      case 'caution': return 'Some concerns were identified during analysis';
      case 'danger': return 'Multiple red flags detected — proceed with caution';
    }
  };

  return (
    <motion.div 
      className="flex flex-col items-center"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* Score Circle */}
      <div className="relative">
        {isTrustworthy ? (
          /* Green checkmark circle for trustworthy sites (75+) */
          <motion.div
            className="w-36 h-36 rounded-full bg-success flex items-center justify-center"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, duration: 0.3, type: "spring", stiffness: 200 }}
            >
              <Check className="w-16 h-16 text-success-foreground" strokeWidth={3} />
            </motion.div>
          </motion.div>
        ) : (
          /* Regular gauge for scores below 75 */
          <>
            <svg className="w-36 h-36 -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="6"
                strokeLinecap="round"
                opacity="0.4"
              />
              {/* Progress circle */}
              <motion.circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                className={getStrokeColor()}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
              />
            </svg>
            
            {/* Score text in center */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span 
                className={`text-4xl font-display font-bold ${getVerdictColor()}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.3 }}
              >
                {score}
              </motion.span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium mt-0.5">
                Trust Score
              </span>
            </div>
          </>
        )}
      </div>
      
      {/* Verdict Section */}
      <motion.div
        className="mt-5 flex flex-col items-center gap-2"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        {/* Verdict Badge */}
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm ${
            verdict === 'safe' 
              ? 'bg-success/15 text-success border border-success/25' 
              : verdict === 'caution' 
              ? 'bg-warning/15 text-warning border border-warning/25' 
              : 'bg-danger/15 text-danger border border-danger/30'
          }`}
        >
          {getVerdictIcon()}
          <span>{getVerdictLabel()}</span>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground text-center max-w-xs mt-1">
          {getVerdictDescription()}
        </p>

        {/* Issues count */}
        {redFlagsCount > 0 && (
          <motion.div
            className={`text-xs font-medium px-3 py-1 rounded-full mt-1 ${
              verdict === 'danger' 
                ? 'bg-danger/10 text-danger' 
                : 'bg-muted text-muted-foreground'
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            {redFlagsCount} issue{redFlagsCount !== 1 ? 's' : ''} identified
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
