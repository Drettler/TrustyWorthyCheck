import { motion } from 'framer-motion';
import { 
  CheckCircle, XCircle, Server, Shield, MapPin, 
  CreditCard, FileText, Users, Info
} from 'lucide-react';
import type { ConfidenceData } from '@/lib/api/url-check';

interface ConfidenceBreakdownProps {
  confidence: ConfidenceData;
}

interface VerificationSource {
  name: string;
  icon: React.ElementType;
  verified: boolean;
  description: string;
}

export function ConfidenceBreakdown({ confidence }: ConfidenceBreakdownProps) {
  // Map verified sources to display items
  const allSources: VerificationSource[] = [
    {
      name: 'WHOIS data',
      icon: Server,
      verified: confidence.verifiedSources.includes('WHOIS data'),
      description: 'Domain registration information',
    },
    {
      name: 'VirusTotal scan',
      icon: Shield,
      verified: confidence.verifiedSources.includes('VirusTotal scan'),
      description: 'Security engine analysis',
    },
    {
      name: 'Physical address',
      icon: MapPin,
      verified: confidence.verifiedSources.includes('Physical address'),
      description: 'Business location verification',
    },
    {
      name: 'Payment methods',
      icon: CreditCard,
      verified: confidence.verifiedSources.includes('Payment methods'),
      description: 'Payment gateway detection',
    },
    {
      name: 'Business policies',
      icon: FileText,
      verified: confidence.verifiedSources.includes('Business policies'),
      description: 'Privacy, terms, returns',
    },
    {
      name: 'External links',
      icon: Users,
      verified: confidence.verifiedSources.includes('External links'),
      description: 'Social media & reviews',
    },
  ];

  const verifiedCount = allSources.filter(s => s.verified).length;

  const getConfidenceStyles = () => {
    switch (confidence.level) {
      case 'high':
        return {
          bg: 'bg-success/5',
          border: 'border-success/20',
          badge: 'bg-success/15 text-success',
          bar: 'bg-success',
        };
      case 'medium':
        return {
          bg: 'bg-warning/5',
          border: 'border-warning/20',
          badge: 'bg-warning/15 text-warning',
          bar: 'bg-warning',
        };
      case 'low':
        return {
          bg: 'bg-muted/30',
          border: 'border-border',
          badge: 'bg-muted text-muted-foreground',
          bar: 'bg-muted-foreground',
        };
    }
  };

  const styles = getConfidenceStyles();

  return (
    <motion.div
      className={`rounded-xl border p-4 ${styles.bg} ${styles.border}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Info className="w-4 h-4 text-primary" />
          Analysis Confidence
        </h3>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${styles.badge}`}>
          {confidence.level}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-muted/50 rounded-full overflow-hidden mb-3">
        <motion.div
          className={`h-full rounded-full ${styles.bar}`}
          initial={{ width: 0 }}
          animate={{ width: `${(verifiedCount / 6) * 100}%` }}
          transition={{ duration: 0.5, delay: 0.2 }}
        />
      </div>

      <p className="text-xs text-muted-foreground mb-3">
        {confidence.message}
      </p>

      {/* Sources grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {allSources.map((source, index) => {
          const Icon = source.icon;
          return (
            <motion.div
              key={source.name}
              className={`flex items-center gap-2 p-2 rounded-lg ${
                source.verified 
                  ? 'bg-success/10 border border-success/20' 
                  : 'bg-muted/30 border border-border/50'
              }`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * index }}
              title={source.description}
            >
              <div className={`flex-shrink-0 ${source.verified ? 'text-success' : 'text-muted-foreground'}`}>
                {source.verified ? (
                  <CheckCircle className="w-3.5 h-3.5" />
                ) : (
                  <XCircle className="w-3.5 h-3.5" />
                )}
              </div>
              <span className={`text-xs truncate ${source.verified ? 'text-foreground' : 'text-muted-foreground'}`}>
                {source.name.replace(' data', '').replace(' scan', '')}
              </span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
