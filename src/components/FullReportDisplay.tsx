import { motion } from 'framer-motion';
import { 
  Shield, Globe, Building2, AlertTriangle, CheckCircle, DollarSign, 
  Users, Image, Lock, FileText, ShieldCheck, Calendar, TrendingDown,
  ExternalLink, MapPin, Phone, Mail, Clock, Server, Eye, Download,
  Printer, Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TrustScoreGauge } from './TrustScoreGauge';
import { AnalysisCard } from './AnalysisCard';
import { FlagsList } from './FlagsList';
import type { AnalysisResult } from '@/lib/api/url-check';

interface FullReportDisplayProps {
  result: AnalysisResult;
  url: string;
  onBack: () => void;
}

export function FullReportDisplay({ result, url, onBack }: FullReportDisplayProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 print:space-y-4">
      {/* Header Actions */}
      <motion.div 
        className="flex items-center justify-between print:hidden"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Button variant="outline" onClick={onBack}>
          ← Back to Checker
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print Report
          </Button>
        </div>
      </motion.div>

      {/* Report Header */}
      <motion.div 
        className="rounded-2xl border border-border bg-card p-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium text-primary">Full TrustworthyCheck Report</span>
          <span className="ml-auto text-xs text-muted-foreground">
            Generated {new Date().toLocaleDateString()}
          </span>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="flex-shrink-0">
            <TrustScoreGauge 
              score={result.trustScore} 
              verdict={result.verdict}
              redFlagsCount={result.details.redFlags?.length || 0}
              confidence={result.confidence}
            />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="font-display text-2xl font-bold mb-2">
              {result.scrapedData?.title || result.details.domain.name}
            </h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm text-muted-foreground mb-3">
              <span className="flex items-center gap-1">
                <Globe className="w-4 h-4" />
                {result.details.domain.name}
              </span>
              {result.details.domain.ssl && (
                <span className="flex items-center gap-1 text-success">
                  <Lock className="w-3 h-3" />
                  SSL Secured
                </span>
              )}
            </div>
            <p className="text-muted-foreground">{result.summary}</p>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats Grid */}
      <motion.div 
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <Calendar className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
          <p className="text-xs text-muted-foreground mb-1">Domain Age</p>
          <p className="font-semibold text-sm">
            {result.proFeatures?.whois.domainAge || result.details.domain.age}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <ShieldCheck className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
          <p className="text-xs text-muted-foreground mb-1">Security Scan</p>
          <p className={`font-semibold text-sm ${result.proFeatures?.virusTotal.isMalicious ? 'text-danger' : 'text-success'}`}>
            {result.proFeatures?.virusTotal.isMalicious 
              ? `${result.proFeatures.virusTotal.maliciousCount} Threats`
              : 'Clean'}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <TrendingDown className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
          <p className="text-xs text-muted-foreground mb-1">Pricing</p>
          <p className={`font-semibold text-sm ${result.details.pricing.suspiciouslyLow ? 'text-warning' : 'text-foreground'}`}>
            {result.details.pricing.comparisonToMarket === 'much_lower' ? 'Very Low' :
             result.details.pricing.comparisonToMarket === 'slightly_lower' ? 'Below Market' :
             result.details.pricing.comparisonToMarket === 'higher' ? 'Above Market' : 'Normal'}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <Building2 className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
          <p className="text-xs text-muted-foreground mb-1">Business Info</p>
          <p className={`font-semibold text-sm ${result.details.business.hasContactInfo ? 'text-success' : 'text-warning'}`}>
            {result.details.business.hasContactInfo ? 'Verified' : 'Limited'}
          </p>
        </div>
      </motion.div>

      {/* Concerns & Positive Signals */}
      <div className="grid md:grid-cols-2 gap-4">
        <AnalysisCard
          title="Concerns Found"
          icon={AlertTriangle}
          status={result.details.redFlags.length > 0 ? 'danger' : 'success'}
          delay={0.2}
        >
          <FlagsList items={result.details.redFlags} type="red" />
          {result.details.redFlags.length === 0 && (
            <p className="text-sm text-muted-foreground">No significant concerns identified</p>
          )}
        </AnalysisCard>

        <AnalysisCard
          title="Positive Signals"
          icon={CheckCircle}
          status={result.details.positiveSignals.length > 0 ? 'success' : 'neutral'}
          delay={0.25}
        >
          <FlagsList items={result.details.positiveSignals} type="green" />
          {result.details.positiveSignals.length === 0 && (
            <p className="text-sm text-muted-foreground">No positive signals detected</p>
          )}
        </AnalysisCard>
      </div>

      {/* Detailed Analysis Sections */}
      <AnalysisCard
        title="Business Legitimacy"
        icon={Building2}
        status={result.details.business.hasContactInfo && result.details.business.hasPhysicalAddress ? 'success' : 'warning'}
        delay={0.3}
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Phone className="w-4 h-4" /> Contact Info
              </span>
              <span className={`text-sm font-medium ${result.details.business.hasContactInfo ? 'text-success' : 'text-warning'}`}>
                {result.details.business.hasContactInfo ? 'Found' : 'Not Found'}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Physical Address
              </span>
              <span className={`text-sm font-medium ${result.details.business.hasPhysicalAddress ? 'text-success' : 'text-warning'}`}>
                {result.details.business.addressVerification === 'verified' ? 'Verified' :
                 result.details.business.addressVerification === 'suspicious' ? 'Suspicious' :
                 result.details.business.addressVerification === 'po_box' ? 'PO Box' : 'Not Found'}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <FileText className="w-4 h-4" /> About Page
              </span>
              <span className={`text-sm font-medium ${result.details.business.hasAboutPage ? 'text-success' : 'text-warning'}`}>
                {result.details.business.hasAboutPage ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground">Privacy Policy</span>
              <span className={`text-sm font-medium ${result.details.business.hasPrivacyPolicy ? 'text-success' : 'text-warning'}`}>
                {result.details.business.hasPrivacyPolicy ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground">Terms of Service</span>
              <span className={`text-sm font-medium ${result.details.business.hasTerms ? 'text-success' : 'text-warning'}`}>
                {result.details.business.hasTerms ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground">Return Policy</span>
              <span className={`text-sm font-medium ${result.details.business.hasReturnPolicy ? 'text-success' : 'text-warning'}`}>
                {result.details.business.hasReturnPolicy ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>
      </AnalysisCard>

      {/* Domain & Security */}
      <AnalysisCard
        title="Domain & Security Analysis"
        icon={Shield}
        status={result.proFeatures?.virusTotal.isMalicious ? 'danger' : 'success'}
        delay={0.35}
      >
        <div className="space-y-4">
          {/* WHOIS Data */}
          {result.proFeatures?.whois.available && (
            <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Server className="w-4 h-4" /> WHOIS Information
              </h4>
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Registrar:</span>
                  <p className="font-medium">{result.proFeatures.whois.registrar || 'Unknown'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Created:</span>
                  <p className="font-medium">{result.proFeatures.whois.createdDate || 'Unknown'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Expires:</span>
                  <p className="font-medium">{result.proFeatures.whois.expiryDate || 'Unknown'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Privacy Protected:</span>
                  <p className="font-medium">{result.proFeatures.whois.isPrivacyProtected ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </div>
          )}

          {/* VirusTotal Data */}
          {result.proFeatures?.virusTotal.available && (
            <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> Security Scan Results
              </h4>
              <div className="grid sm:grid-cols-4 gap-3 text-sm">
                <div className="text-center p-3 rounded-lg bg-background">
                  <p className={`text-2xl font-bold ${result.proFeatures.virusTotal.maliciousCount > 0 ? 'text-danger' : 'text-success'}`}>
                    {result.proFeatures.virusTotal.maliciousCount}
                  </p>
                  <p className="text-xs text-muted-foreground">Malicious</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-background">
                  <p className={`text-2xl font-bold ${result.proFeatures.virusTotal.suspiciousCount > 0 ? 'text-warning' : 'text-foreground'}`}>
                    {result.proFeatures.virusTotal.suspiciousCount}
                  </p>
                  <p className="text-xs text-muted-foreground">Suspicious</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-background">
                  <p className="text-2xl font-bold text-success">
                    {result.proFeatures.virusTotal.harmlessCount}
                  </p>
                  <p className="text-xs text-muted-foreground">Clean</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-background">
                  <p className="text-2xl font-bold text-muted-foreground">
                    {result.proFeatures.virusTotal.totalEngines}
                  </p>
                  <p className="text-xs text-muted-foreground">Engines</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </AnalysisCard>

      {/* Dropshipper Analysis */}
      <AnalysisCard
        title="Fulfillment Model Analysis"
        icon={AlertTriangle}
        status={result.details.dropshipperIndicators.isLikelyDropshipper ? 'warning' : 'success'}
        delay={0.4}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Likely Dropshipper</span>
            <span className={`text-sm font-medium px-2 py-1 rounded-full ${
              result.details.dropshipperIndicators.isLikelyDropshipper 
                ? 'bg-warning/10 text-warning' 
                : 'bg-success/10 text-success'
            }`}>
              {result.details.dropshipperIndicators.isLikelyDropshipper ? 'Yes' : 'No'}
            </span>
          </div>
          {result.details.dropshipperIndicators.confidence && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Confidence Level</span>
              <span className="text-sm font-medium capitalize">{result.details.dropshipperIndicators.confidence}</span>
            </div>
          )}
          {result.details.dropshipperIndicators.reasons.length > 0 && (
            <div className="mt-3 p-3 rounded-lg bg-muted/30">
              <p className="text-xs text-muted-foreground mb-2">Indicators:</p>
              <ul className="space-y-1">
                {result.details.dropshipperIndicators.reasons.map((reason, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <span className="text-warning">•</span>
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </AnalysisCard>

      {/* Pricing Analysis */}
      <AnalysisCard
        title="Pricing Analysis"
        icon={DollarSign}
        status={result.details.pricing.suspiciouslyLow ? 'warning' : 'success'}
        delay={0.45}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Market Comparison</span>
            <span className={`text-sm font-medium px-2 py-1 rounded-full ${
              result.details.pricing.comparisonToMarket === 'much_lower' 
                ? 'bg-danger/10 text-danger' 
                : result.details.pricing.comparisonToMarket === 'slightly_lower'
                ? 'bg-warning/10 text-warning'
                : 'bg-success/10 text-success'
            }`}>
              {result.details.pricing.comparisonToMarket === 'much_lower' ? 'Much Lower Than Market' :
               result.details.pricing.comparisonToMarket === 'slightly_lower' ? 'Below Market' :
               result.details.pricing.comparisonToMarket === 'higher' ? 'Above Market' : 'Normal Pricing'}
            </span>
          </div>
          {result.details.pricing.notes && (
            <p className="text-sm text-muted-foreground p-3 rounded-lg bg-muted/30">
              {result.details.pricing.notes}
            </p>
          )}
          {result.proFeatures?.priceComparison && result.proFeatures.priceComparison.productsAnalyzed > 0 && (
            <div className="grid sm:grid-cols-2 gap-3 mt-3">
              <div className="p-3 rounded-lg bg-muted/30 text-center">
                <p className="text-2xl font-bold">{result.proFeatures.priceComparison.productsAnalyzed}</p>
                <p className="text-xs text-muted-foreground">Products Analyzed</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/30 text-center">
                <p className={`text-2xl font-bold ${result.proFeatures.priceComparison.averageDiscount >= 50 ? 'text-warning' : 'text-foreground'}`}>
                  {result.proFeatures.priceComparison.averageDiscount}%
                </p>
                <p className="text-xs text-muted-foreground">Avg Discount</p>
              </div>
            </div>
          )}
        </div>
      </AnalysisCard>

      {/* Social Proof */}
      <AnalysisCard
        title="Social Proof & Reviews"
        icon={Users}
        status={result.details.socialProof.reviewsAppearAuthentic ? 'success' : 'warning'}
        delay={0.5}
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground">Has Reviews</span>
              <span className={`text-sm font-medium ${result.details.socialProof.hasReviews ? 'text-success' : 'text-warning'}`}>
                {result.details.socialProof.hasReviews ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground">Reviews Appear Authentic</span>
              <span className={`text-sm font-medium ${result.details.socialProof.reviewsAppearAuthentic ? 'text-success' : 'text-warning'}`}>
                {result.details.socialProof.reviewsAppearAuthentic ? 'Yes' : 'Questionable'}
              </span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground">Social Media Links</span>
              <span className={`text-sm font-medium ${result.details.socialProof.hasSocialLinks ? 'text-success' : 'text-warning'}`}>
                {result.details.socialProof.hasSocialLinks ? 'Found' : 'Not Found'}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground">External Reviews</span>
              <span className={`text-sm font-medium ${result.details.socialProof.externalReviewPlatforms ? 'text-success' : 'text-warning'}`}>
                {result.details.socialProof.externalReviewPlatforms ? 'Found' : 'Not Found'}
              </span>
            </div>
          </div>
        </div>
        {result.details.socialProof.notes && (
          <p className="text-sm text-muted-foreground mt-3 p-3 rounded-lg bg-muted/30">
            {result.details.socialProof.notes}
          </p>
        )}
      </AnalysisCard>

      {/* Website Quality */}
      <AnalysisCard
        title="Website Quality"
        icon={Globe}
        status={result.details.websiteQuality.overallProfessionalism === 'high' ? 'success' : 
                result.details.websiteQuality.overallProfessionalism === 'medium' ? 'warning' : 'neutral'}
        delay={0.55}
      >
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="text-center p-4 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground mb-1">Design Quality</p>
            <p className="font-semibold capitalize">{result.details.websiteQuality.designQuality}</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground mb-1">Grammar Quality</p>
            <p className="font-semibold capitalize">{result.details.websiteQuality.grammarQuality}</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground mb-1">Overall Professionalism</p>
            <p className="font-semibold capitalize">{result.details.websiteQuality.overallProfessionalism}</p>
          </div>
        </div>
      </AnalysisCard>

      {/* Image Analysis */}
      <AnalysisCard
        title="Image Analysis"
        icon={Image}
        status={result.details.imageAnalysis.appearsOriginal ? 'success' : 'warning'}
        delay={0.6}
      >
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
            <span className="text-sm text-muted-foreground">Appears Original</span>
            <span className={`text-sm font-medium ${result.details.imageAnalysis.appearsOriginal ? 'text-success' : 'text-warning'}`}>
              {result.details.imageAnalysis.appearsOriginal ? 'Yes' : 'No'}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
            <span className="text-sm text-muted-foreground">Stock Photos</span>
            <span className={`text-sm font-medium ${result.details.imageAnalysis.stockPhotoLikely ? 'text-warning' : 'text-success'}`}>
              {result.details.imageAnalysis.stockPhotoLikely ? 'Likely' : 'Unlikely'}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
            <span className="text-sm text-muted-foreground">Quality</span>
            <span className="text-sm font-medium capitalize">{result.details.imageAnalysis.qualityAssessment}</span>
          </div>
        </div>
      </AnalysisCard>

      {/* Footer */}
      <motion.div 
        className="text-center py-6 border-t border-border"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <p className="text-xs text-muted-foreground">
          This report was generated by TrustworthyCheck. Results are based on automated analysis and should be used alongside your own research.
        </p>
        <Button variant="outline" onClick={onBack} className="mt-4">
          Check Another Website
        </Button>
      </motion.div>
    </div>
  );
}
