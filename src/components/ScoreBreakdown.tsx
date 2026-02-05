import { motion } from 'framer-motion';
import { 
  Shield, Globe, Building2, CreditCard, FileText, 
  Users, TrendingDown, TrendingUp, Minus, AlertTriangle,
  CheckCircle, Clock
} from 'lucide-react';
import type { AnalysisResult } from '@/lib/api/url-check';

interface ScoreBreakdownProps {
  result: AnalysisResult;
}

interface ScoreFactor {
  label: string;
  icon: React.ElementType;
  impact: 'positive' | 'negative' | 'neutral';
  weight: 'high' | 'medium' | 'low';
  description: string;
}

export function ScoreBreakdown({ result }: ScoreBreakdownProps) {
  const factors: ScoreFactor[] = [];
  const details = result.details;

  // Domain age factor
  const domainAge = result.proFeatures?.whois?.domainAgeInDays;
  if (domainAge !== undefined) {
    if (domainAge >= 730) { // 2+ years
      factors.push({
        label: 'Established Domain',
        icon: Clock,
        impact: 'positive',
        weight: 'high',
        description: `Domain is ${Math.floor(domainAge / 365)}+ years old`,
      });
    } else if (domainAge < 365) {
      factors.push({
        label: 'New Domain',
        icon: Clock,
        impact: 'negative',
        weight: 'medium',
        description: 'Domain is less than 1 year old',
      });
    }
  }

  // SSL security
  if (details.domain.ssl) {
    factors.push({
      label: 'SSL Certificate',
      icon: Shield,
      impact: 'positive',
      weight: 'high',
      description: 'Secure HTTPS connection verified',
    });
  } else {
    factors.push({
      label: 'No SSL',
      icon: Shield,
      impact: 'negative',
      weight: 'high',
      description: 'Website lacks secure connection',
    });
  }

  // VirusTotal scan
  const vt = result.proFeatures?.virusTotal;
  if (vt?.available) {
    if (vt.maliciousCount > 0) {
      factors.push({
        label: 'Security Threats',
        icon: AlertTriangle,
        impact: 'negative',
        weight: 'high',
        description: `${vt.maliciousCount} engines flagged as malicious`,
      });
    } else if (vt.totalEngines > 50) {
      factors.push({
        label: 'Clean Scan',
        icon: Shield,
        impact: 'positive',
        weight: 'medium',
        description: `Passed ${vt.totalEngines}+ security engine checks`,
      });
    }
  }

  // Business info
  if (details.business.hasContactInfo && details.business.hasPhysicalAddress) {
    factors.push({
      label: 'Verified Business',
      icon: Building2,
      impact: 'positive',
      weight: 'high',
      description: 'Contact info and address found',
    });
  } else if (!details.business.hasContactInfo) {
    factors.push({
      label: 'Limited Contact',
      icon: Building2,
      impact: 'negative',
      weight: 'medium',
      description: 'No contact information found',
    });
  }

  // Policies
  const policiesCount = [
    details.business.hasPrivacyPolicy,
    details.business.hasTerms,
    details.business.hasReturnPolicy,
  ].filter(Boolean).length;
  
  if (policiesCount >= 3) {
    factors.push({
      label: 'Complete Policies',
      icon: FileText,
      impact: 'positive',
      weight: 'medium',
      description: 'Privacy, terms, and return policies found',
    });
  } else if (policiesCount === 0) {
    factors.push({
      label: 'Missing Policies',
      icon: FileText,
      impact: 'negative',
      weight: 'medium',
      description: 'No business policies found',
    });
  }

  // Social proof
  if (details.socialProof.hasSocialLinks && details.socialProof.externalReviewPlatforms) {
    factors.push({
      label: 'Social Presence',
      icon: Users,
      impact: 'positive',
      weight: 'medium',
      description: 'Active on social media and review platforms',
    });
  }

  // Red flags count
  if (details.redFlags.length > 5) {
    factors.push({
      label: 'Multiple Issues',
      icon: AlertTriangle,
      impact: 'negative',
      weight: 'high',
      description: `${details.redFlags.length} concerns identified`,
    });
  }

  // Dropshipper warning
  if (details.dropshipperIndicators.isLikelyDropshipper && details.dropshipperIndicators.confidence === 'high') {
    factors.push({
      label: 'Dropshipper Risk',
      icon: TrendingDown,
      impact: 'negative',
      weight: 'medium',
      description: 'High likelihood of dropshipping model',
    });
  }

  // Sort: negative high first, then medium, then positive
  factors.sort((a, b) => {
    const impactOrder = { negative: 0, neutral: 1, positive: 2 };
    const weightOrder = { high: 0, medium: 1, low: 2 };
    
    if (impactOrder[a.impact] !== impactOrder[b.impact]) {
      return impactOrder[a.impact] - impactOrder[b.impact];
    }
    return weightOrder[a.weight] - weightOrder[b.weight];
  });

  const getImpactStyles = (impact: string, weight: string) => {
    const baseStyles = {
      positive: {
        bg: 'bg-success/10',
        border: 'border-success/20',
        icon: 'text-success',
        bar: 'bg-success',
      },
      negative: {
        bg: 'bg-danger/10',
        border: 'border-danger/20',
        icon: 'text-danger',
        bar: 'bg-danger',
      },
      neutral: {
        bg: 'bg-muted/50',
        border: 'border-border',
        icon: 'text-muted-foreground',
        bar: 'bg-muted-foreground',
      },
    };
    return baseStyles[impact as keyof typeof baseStyles] || baseStyles.neutral;
  };

  const getWeightWidth = (weight: string) => {
    switch (weight) {
      case 'high': return 'w-full';
      case 'medium': return 'w-2/3';
      case 'low': return 'w-1/3';
      default: return 'w-1/2';
    }
  };

  const ImpactIcon = ({ impact }: { impact: string }) => {
    switch (impact) {
      case 'positive': return <TrendingUp className="w-3 h-3" />;
      case 'negative': return <TrendingDown className="w-3 h-3" />;
      default: return <Minus className="w-3 h-3" />;
    }
  };

  if (factors.length === 0) return null;

  return (
    <motion.div
      className="rounded-xl border border-border bg-card p-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
        <Globe className="w-4 h-4 text-primary" />
        Score Breakdown
      </h3>

      <div className="space-y-2">
        {factors.slice(0, 6).map((factor, index) => {
          const styles = getImpactStyles(factor.impact, factor.weight);
          const Icon = factor.icon;

          return (
            <motion.div
              key={index}
              className={`flex items-center gap-3 p-2.5 rounded-lg ${styles.bg} border ${styles.border}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <div className={`flex-shrink-0 ${styles.icon}`}>
                <Icon className="w-4 h-4" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{factor.label}</span>
                  <span className={`flex items-center gap-0.5 text-xs ${styles.icon}`}>
                    <ImpactIcon impact={factor.impact} />
                    <span className="capitalize">{factor.weight}</span>
                  </span>
                </div>
                <p className="text-xs text-muted-foreground truncate">{factor.description}</p>
              </div>

              {/* Impact bar */}
              <div className="w-16 h-1.5 bg-muted/50 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full ${styles.bar} rounded-full`}
                  initial={{ width: 0 }}
                  animate={{ width: factor.weight === 'high' ? '100%' : factor.weight === 'medium' ? '66%' : '33%' }}
                  transition={{ delay: 0.2 + 0.1 * index, duration: 0.3 }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {factors.length > 6 && (
        <p className="text-xs text-muted-foreground text-center mt-3">
          +{factors.length - 6} more factors analyzed
        </p>
      )}
    </motion.div>
  );
}
