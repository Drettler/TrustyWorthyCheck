import { motion } from 'framer-motion';
import { Users, AlertTriangle, Flag, Clock, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CommunityReport {
  reportCount: number;
  lastReportedAt?: string;
  reasons?: string[];
}

interface CommunityReportsProps {
  domain: string;
  report?: CommunityReport | null;
  onReportSite?: () => void;
}

export function CommunityReports({ domain, report, onReportSite }: CommunityReportsProps) {
  const hasReports = report && report.reportCount > 0;
  const isHighlyReported = report && report.reportCount >= 5;
  
  const getTimeAgo = (dateStr?: string) => {
    if (!dateStr) return 'Recently';
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <motion.div
      className={`rounded-xl border p-4 ${
        isHighlyReported 
          ? 'bg-danger/5 border-danger/30' 
          : hasReports 
          ? 'bg-warning/5 border-warning/30' 
          : 'bg-card border-border'
      }`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${
            isHighlyReported 
              ? 'bg-danger/15' 
              : hasReports 
              ? 'bg-warning/15' 
              : 'bg-muted'
          }`}>
            <Users className={`w-4 h-4 ${
              isHighlyReported 
                ? 'text-danger' 
                : hasReports 
                ? 'text-warning' 
                : 'text-muted-foreground'
            }`} />
          </div>
          
          <div className="flex-1">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              Community Reports
              {isHighlyReported && (
                <span className="inline-flex items-center gap-1 text-xs bg-danger/15 text-danger px-2 py-0.5 rounded-full">
                  <AlertTriangle className="w-3 h-3" />
                  High Risk
                </span>
              )}
            </h3>
            
            {hasReports ? (
              <div className="mt-2 space-y-2">
                <p className={`text-sm font-medium ${isHighlyReported ? 'text-danger' : 'text-warning'}`}>
                  {report.reportCount} user{report.reportCount !== 1 ? 's' : ''} reported this site
                </p>
                
                {report.reasons && report.reasons.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {report.reasons.slice(0, 3).map((reason, i) => (
                      <span 
                        key={i}
                        className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground"
                      >
                        {reason}
                      </span>
                    ))}
                    {report.reasons.length > 3 && (
                      <span className="text-xs text-muted-foreground">
                        +{report.reasons.length - 3} more
                      </span>
                    )}
                  </div>
                )}
                
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Last reported: {getTimeAgo(report.lastReportedAt)}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground mt-1">
                No reports from our community yet
              </p>
            )}
          </div>
        </div>

        {onReportSite && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReportSite}
            className="flex-shrink-0 text-xs"
          >
            <Flag className="w-3 h-3 mr-1" />
            Report
          </Button>
        )}
      </div>
    </motion.div>
  );
}
