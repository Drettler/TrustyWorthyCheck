import { useState, useEffect, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, Shield, AlertTriangle, Clock, ExternalLink, 
  RefreshCw, Filter, TrendingUp, Building2, Newspaper,
  ArrowLeft, Globe, FileWarning, CreditCard, UserX, Bug
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ThreatFeed {
  id: string;
  source: string;
  source_url: string | null;
  title: string;
  description: string | null;
  threat_type: string;
  domains: string[] | null;
  tactics: string[] | null;
  severity: string;
  published_at: string | null;
  fetched_at: string;
}

interface FeedSource {
  id: string;
  name: string;
  url: string;
  feed_type: string;
  last_fetched_at: string | null;
  status: string;
}

const threatTypeConfig: Record<string, { label: string; icon: any; color: string }> = {
  phishing: { label: 'Phishing', icon: FileWarning, color: 'text-orange-500 bg-orange-500/10' },
  scam: { label: 'Scam/Fraud', icon: AlertTriangle, color: 'text-danger bg-danger/10' },
  malware: { label: 'Malware', icon: Bug, color: 'text-purple-500 bg-purple-500/10' },
  ransomware: { label: 'Ransomware', icon: Shield, color: 'text-red-600 bg-red-600/10' },
  identity_theft: { label: 'Identity Theft', icon: UserX, color: 'text-pink-500 bg-pink-500/10' },
  payment_fraud: { label: 'Payment Fraud', icon: CreditCard, color: 'text-amber-500 bg-amber-500/10' },
  general: { label: 'General', icon: Globe, color: 'text-blue-500 bg-blue-500/10' },
};

const sourceTypeConfig: Record<string, { label: string; icon: any; color: string }> = {
  government: { label: 'Government', icon: Building2, color: 'text-blue-600 bg-blue-600/10' },
  nonprofit: { label: 'Non-Profit', icon: Shield, color: 'text-green-600 bg-green-600/10' },
  blog: { label: 'Security Blog', icon: Newspaper, color: 'text-purple-600 bg-purple-600/10' },
};

const FEED_SOURCES = [
  { name: 'FTC Consumer Alerts', url: 'https://consumer.ftc.gov/consumer-alerts', type: 'government', description: 'Federal Trade Commission consumer protection alerts' },
  { name: 'FBI IC3', url: 'https://www.ic3.gov/', type: 'government', description: 'Internet Crime Complaint Center public service announcements' },
  { name: 'BBB Scam Tracker', url: 'https://www.bbb.org/scamtracker', type: 'nonprofit', description: 'Better Business Bureau community scam reports' },
  { name: 'CISA Advisories', url: 'https://www.cisa.gov/news-events/cybersecurity-advisories', type: 'government', description: 'Cybersecurity & Infrastructure Security Agency alerts' },
  { name: 'Krebs on Security', url: 'https://krebsonsecurity.com/', type: 'blog', description: 'In-depth security news and investigation' },
  { name: 'Google Safe Browsing', url: 'https://safebrowsing.google.com/', type: 'government', description: 'Google threat intelligence on unsafe websites' },
];

function timeAgo(dateString: string | null): string {
  if (!dateString) return 'Unknown';
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

export default function ThreatFeeds() {
  const [threats, setThreats] = useState<ThreatFeed[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedSeverity, setSelectedSeverity] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchThreats();
  }, []);

  const fetchThreats = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('threat_feeds')
        .select('*')
        .order('published_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setThreats(data || []);
    } catch (error) {
      console.error('Error fetching threats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshFeeds = async () => {
    setIsRefreshing(true);
    try {
      const { error } = await supabase.functions.invoke('fetch-threat-feeds');
      
      if (error) throw error;
      
      toast({
        title: '🔄 Feeds Updated',
        description: 'Threat intelligence has been refreshed from sources.',
      });
      
      await fetchThreats();
    } catch (error) {
      console.error('Error refreshing feeds:', error);
      toast({
        title: 'Refresh Failed',
        description: 'Could not update threat feeds. Try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const filteredThreats = threats.filter(threat => {
    const matchesSearch = !searchQuery || 
      threat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      threat.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !selectedType || threat.threat_type === selectedType;
    const matchesSeverity = !selectedSeverity || threat.severity === selectedSeverity;
    return matchesSearch && matchesType && matchesSeverity;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <SEO 
        title="Public Threat & Scam Feeds"
        description="Real-time threat intelligence from trusted government agencies and security researchers. Stay ahead of phishing, scams, and malware."
        canonical="https://trustworthycheck.com/threat-feeds"
      />
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
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
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <span className="text-4xl">🔎</span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
            Public Threat & Scam Feeds
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            Real-time intelligence from trusted government agencies, security researchers, and fraud monitoring organizations.
          </p>
          
          {/* Report a Scam CTA */}
          <motion.a
            href="https://reportfraud.ftc.gov/"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-danger text-danger-foreground font-semibold hover:bg-danger/90 transition-all shadow-lg hover:shadow-xl hover:scale-105"
          >
            <AlertTriangle className="w-5 h-5" />
            Report a Scam to the FTC
            <ExternalLink className="w-4 h-4" />
          </motion.a>
        </motion.div>

        {/* Trusted Sources Grid */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Trusted Sources
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {FEED_SOURCES.map((source, index) => {
              const config = sourceTypeConfig[source.type] || sourceTypeConfig.government;
              return (
                <motion.a
                  key={source.name}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index }}
                  className="group flex items-start gap-3 p-4 rounded-xl bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-all"
                >
                  <div className={`w-10 h-10 rounded-lg ${config.color} flex items-center justify-center flex-shrink-0`}>
                    <config.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-sm truncate">{source.name}</h3>
                      <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                      {source.description}
                    </p>
                  </div>
                </motion.a>
              );
            })}
          </div>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col md:flex-row gap-4 mb-6"
        >
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search threats..."
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            <select
              value={selectedType || ''}
              onChange={(e) => setSelectedType(e.target.value || null)}
              className="h-10 px-3 rounded-lg border border-border bg-card text-sm"
            >
              <option value="">All Types</option>
              {Object.entries(threatTypeConfig).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>

            <select
              value={selectedSeverity || ''}
              onChange={(e) => setSelectedSeverity(e.target.value || null)}
              className="h-10 px-3 rounded-lg border border-border bg-card text-sm"
            >
              <option value="">All Severity</option>
              <option value="high">🔴 High</option>
              <option value="medium">🟡 Medium</option>
              <option value="low">🟢 Low</option>
            </select>

            <Button
              variant="outline"
              onClick={refreshFeeds}
              disabled={isRefreshing}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Updating...' : 'Refresh'}
            </Button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="p-4 rounded-xl bg-card border border-border">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <TrendingUp className="w-4 h-4" />
              Total Threats
            </div>
            <p className="text-2xl font-bold">{threats.length}</p>
          </div>
          <div className="p-4 rounded-xl bg-danger/5 border border-danger/20">
            <div className="flex items-center gap-2 text-danger text-sm mb-1">
              <AlertTriangle className="w-4 h-4" />
              High Severity
            </div>
            <p className="text-2xl font-bold text-danger">
              {threats.filter(t => t.severity === 'high').length}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-warning/5 border border-warning/20">
            <div className="flex items-center gap-2 text-warning text-sm mb-1">
              <FileWarning className="w-4 h-4" />
              Phishing Alerts
            </div>
            <p className="text-2xl font-bold text-warning">
              {threats.filter(t => t.threat_type === 'phishing').length}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
            <div className="flex items-center gap-2 text-primary text-sm mb-1">
              <Clock className="w-4 h-4" />
              Last Updated
            </div>
            <p className="text-lg font-medium text-primary">
              {threats[0] ? timeAgo(threats[0].fetched_at) : 'Never'}
            </p>
          </div>
        </motion.div>

        {/* Threats List */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-28 rounded-xl bg-card/50 animate-pulse" />
            ))}
          </div>
        ) : filteredThreats.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Shield className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Threats Found</h2>
            <p className="text-muted-foreground mb-6">
              {searchQuery || selectedType || selectedSeverity
                ? 'Try adjusting your filters.'
                : 'Click "Refresh" to fetch the latest threat intelligence.'}
            </p>
            <Button onClick={refreshFeeds} disabled={isRefreshing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Fetch Threats
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-3"
          >
            {filteredThreats.map((threat, index) => {
              const typeConfig = threatTypeConfig[threat.threat_type] || threatTypeConfig.general;
              const TypeIcon = typeConfig.icon;
              
              return (
                <motion.div
                  key={threat.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="group p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-all hover:shadow-lg"
                >
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    {/* Type Icon */}
                    <div className={`w-12 h-12 rounded-xl ${typeConfig.color} flex items-center justify-center flex-shrink-0`}>
                      <TypeIcon className="w-6 h-6" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="font-semibold text-foreground line-clamp-2">
                          {threat.title}
                        </h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${
                          threat.severity === 'high' 
                            ? 'bg-danger/10 text-danger' 
                            : threat.severity === 'medium'
                            ? 'bg-warning/10 text-warning'
                            : 'bg-success/10 text-success'
                        }`}>
                          {threat.severity === 'high' ? '🔴' : threat.severity === 'medium' ? '🟡' : '🟢'} {threat.severity}
                        </span>
                      </div>
                      
                      {threat.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {threat.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className={`px-2 py-0.5 rounded-md ${typeConfig.color}`}>
                          {typeConfig.label}
                        </span>
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {threat.source}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {timeAgo(threat.published_at)}
                        </span>
                        {threat.source_url && (
                          <a
                            href={threat.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-primary hover:underline"
                          >
                            <ExternalLink className="w-3 h-3" />
                            View Source
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 p-4 rounded-xl bg-muted/30 border border-border text-center"
        >
          <p className="text-sm text-muted-foreground">
            <strong>Disclaimer:</strong> Threat intelligence is aggregated from public sources and updated periodically. 
            Always verify information with official sources before taking action.
          </p>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
