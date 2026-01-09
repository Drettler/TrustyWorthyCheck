import { useState, useEffect, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Clock, Flag, TrendingUp, Shield, ExternalLink, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { supabase } from '@/integrations/supabase/client';

interface SiteReport {
  id: string;
  domain: string;
  reasons: string[];
  trustScore: number | null;
  reportCount: number;
  firstReportedAt: string;
  lastReportedAt: string;
}

const reasonLabels: Record<string, { label: string; emoji: string }> = {
  fake_store: { label: 'Fake Store', emoji: '🛒' },
  phishing: { label: 'Phishing', emoji: '🎣' },
  scam: { label: 'Scam/Fraud', emoji: '💰' },
  counterfeit: { label: 'Counterfeit', emoji: '🏷️' },
  malware: { label: 'Malware', emoji: '🦠' },
  other: { label: 'Suspicious', emoji: '⚠️' },
};

function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

export default function RecentReports() {
  const [reports, setReports] = useState<SiteReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'recent' | 'trending'>('recent');

  useEffect(() => {
    fetchReports();
  }, [sortBy]);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke<{ reports: SiteReport[] }>('public-reports', {
        body: null,
        method: 'GET',
      });

      if (error) throw error;
      setReports(data?.reports || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <SEO 
        title="Recently Reported Sites"
        description="View community-flagged suspicious websites. Stay informed about the latest scams and fraudulent sites reported by users."
        canonical="https://trustworthycheck.com/recent-reports"
      />
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Checker
            </Link>
          </Button>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-danger/10 mb-4">
            <Flag className="w-8 h-8 text-danger" />
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
            Recently Reported Sites
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Community-flagged websites that may be fraudulent. Stay informed and protect yourself.
          </p>
        </motion.div>

        {/* Sort Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center gap-2 mb-8"
        >
          <button
            onClick={() => setSortBy('recent')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              sortBy === 'recent'
                ? 'bg-primary text-primary-foreground'
                : 'bg-card border border-border hover:border-primary/40'
            }`}
          >
            <Clock className="w-4 h-4" />
            Most Recent
          </button>
          <button
            onClick={() => setSortBy('trending')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              sortBy === 'trending'
                ? 'bg-primary text-primary-foreground'
                : 'bg-card border border-border hover:border-primary/40'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Most Reported
          </button>
        </motion.div>

        {/* Reports List */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 rounded-xl bg-card/50 animate-pulse" />
            ))}
          </div>
        ) : reports.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Shield className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Reports Yet</h2>
            <p className="text-muted-foreground mb-6">
              Be the first to report a suspicious website and help protect others.
            </p>
            <Button asChild>
              <Link to="/#checker">Check a Website</Link>
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-3"
          >
            {reports.map((report, index) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group p-4 rounded-xl bg-card border border-border hover:border-danger/30 transition-all hover:shadow-lg hover:shadow-danger/5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  {/* Domain & Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="w-4 h-4 text-danger flex-shrink-0" />
                      <span className="font-semibold text-foreground truncate">
                        {report.domain}
                      </span>
                      {report.trustScore !== null && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          report.trustScore < 50 
                            ? 'bg-danger/10 text-danger' 
                            : report.trustScore < 70 
                            ? 'bg-warning/10 text-warning' 
                            : 'bg-success/10 text-success'
                        }`}>
                          Score: {report.trustScore}
                        </span>
                      )}
                    </div>
                    
                    {/* Reasons */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {report.reasons.map((reason) => {
                        const info = reasonLabels[reason] || { label: reason, emoji: '⚠️' };
                        return (
                          <span
                            key={reason}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-danger/10 text-danger text-xs"
                          >
                            <span>{info.emoji}</span>
                            <span>{info.label}</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Flag className="w-3.5 h-3.5" />
                      <span>{report.reportCount} {report.reportCount === 1 ? 'report' : 'reports'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{timeAgo(report.lastReportedAt)}</span>
                    </div>
                  </div>

                  {/* Check Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    asChild
                  >
                    <Link to={`/?check=${encodeURIComponent(report.domain)}`}>
                      <Shield className="w-3.5 h-3.5 mr-1.5" />
                      Analyze
                    </Link>
                  </Button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Footer Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-xs text-muted-foreground mt-8"
        >
          Reports are submitted anonymously by the community. Always verify before taking action.
        </motion.p>
      </main>

      <Footer />
    </div>
  );
}
