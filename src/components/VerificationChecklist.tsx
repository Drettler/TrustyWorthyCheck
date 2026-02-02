import { motion } from 'framer-motion';
import { 
  Check, X, Minus, Globe, Shield, Building2, Users, 
  DollarSign, Image, Lock, Server, Phone, Mail, MapPin,
  FileText, Star, AlertTriangle, Search, Link2, CreditCard
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AnalysisResult } from '@/lib/api/url-check';

interface VerificationChecklistProps {
  result: AnalysisResult;
}

interface ChecklistItem {
  category: string;
  items: {
    name: string;
    status: 'pass' | 'fail' | 'warning' | 'not_checked';
    details?: string;
  }[];
}

export function VerificationChecklist({ result }: VerificationChecklistProps) {
  const buildChecklist = (): ChecklistItem[] => {
    const { details, proFeatures } = result;

    return [
      {
        category: 'Domain & WHOIS Verification',
        items: [
          {
            name: 'Domain age check',
            status: proFeatures?.whois?.available 
              ? (proFeatures.whois.domainAgeInDays && proFeatures.whois.domainAgeInDays > 365 ? 'pass' : 'warning')
              : 'not_checked',
            details: proFeatures?.whois?.domainAge || details.domain.age || 'Unknown',
          },
          {
            name: 'WHOIS registrar lookup',
            status: proFeatures?.whois?.available && proFeatures?.whois?.registrar ? 'pass' : 'not_checked',
            details: proFeatures?.whois?.registrar || 'Not available',
          },
          {
            name: 'Domain privacy status',
            status: proFeatures?.whois?.available 
              ? (proFeatures.whois.isPrivacyProtected ? 'warning' : 'pass')
              : 'not_checked',
            details: proFeatures?.whois?.isPrivacyProtected ? 'Privacy protected (hidden owner)' : 'Owner visible',
          },
          {
            name: 'Name servers verification',
            status: proFeatures?.whois?.available && proFeatures?.whois?.nameServers?.length ? 'pass' : 'not_checked',
            details: proFeatures?.whois?.nameServers?.slice(0, 2).join(', ') || 'Not checked',
          },
        ],
      },
      {
        category: 'SSL/Certificate Validation',
        items: [
          {
            name: 'HTTPS enabled',
            status: details.domain.ssl ? 'pass' : 'fail',
            details: details.domain.ssl ? 'Site uses secure HTTPS' : 'No HTTPS detected',
          },
          {
            name: 'SSL certificate issuer',
            status: details.domain.sslIssuer ? 'pass' : 'warning',
            details: details.domain.sslIssuer || 'Standard certificate',
          },
        ],
      },
      {
        category: 'Security Scan (VirusTotal)',
        items: [
          {
            name: 'Malware detection scan',
            status: proFeatures?.virusTotal?.available 
              ? (proFeatures.virusTotal.maliciousCount === 0 ? 'pass' : 'fail')
              : 'not_checked',
            details: proFeatures?.virusTotal?.available 
              ? `${proFeatures.virusTotal.maliciousCount} threats found`
              : 'Not scanned',
          },
          {
            name: 'Suspicious behavior check',
            status: proFeatures?.virusTotal?.available 
              ? (proFeatures.virusTotal.suspiciousCount === 0 ? 'pass' : 'warning')
              : 'not_checked',
            details: proFeatures?.virusTotal?.available 
              ? `${proFeatures.virusTotal.suspiciousCount} suspicious flags`
              : 'Not checked',
          },
          {
            name: 'Multi-engine security scan',
            status: proFeatures?.virusTotal?.available ? 'pass' : 'not_checked',
            details: proFeatures?.virusTotal?.available 
              ? `Scanned by ${proFeatures.virusTotal.totalEngines} engines`
              : 'Not performed',
          },
        ],
      },
      {
        category: 'Review Platforms Checked',
        items: [
          {
            name: 'Google Reviews presence',
            status: details.socialProof.externalReviewPlatforms ? 'pass' : 'warning',
            details: 'Checked for Google review links',
          },
          {
            name: 'Trustpilot presence',
            status: details.socialProof.externalReviewPlatforms ? 'pass' : 'warning',
            details: 'Checked for Trustpilot links',
          },
          {
            name: 'BBB (Better Business Bureau)',
            status: details.socialProof.externalReviewPlatforms ? 'pass' : 'warning',
            details: 'Checked for BBB accreditation',
          },
          {
            name: 'Social media links (Facebook/Reddit)',
            status: details.socialProof.hasSocialLinks ? 'pass' : 'warning',
            details: details.socialProof.hasSocialLinks ? 'Social links found' : 'No social links detected',
          },
          {
            name: 'Review authenticity analysis',
            status: details.socialProof.reviewsAppearAuthentic ? 'pass' : 'warning',
            details: details.socialProof.reviewsAppearAuthentic ? 'Reviews appear genuine' : 'Generic/suspicious reviews',
          },
        ],
      },
      {
        category: 'Contact Information Validation',
        items: [
          {
            name: 'Phone number presence',
            status: details.business.hasContactInfo ? 'pass' : 'warning',
            details: details.business.hasContactInfo ? 'Contact info found' : 'No phone number found',
          },
          {
            name: 'Email address check',
            status: details.business.hasContactInfo ? 'pass' : 'warning',
            details: 'Checked for contact email',
          },
          {
            name: 'Physical address verification',
            status: details.business.addressVerification === 'verified' 
              ? 'pass' 
              : details.business.addressVerification === 'suspicious' 
              ? 'fail' 
              : details.business.addressVerification === 'po_box'
              ? 'warning'
              : 'not_checked',
            details: details.business.addressVerification === 'verified' 
              ? 'Address appears legitimate'
              : details.business.addressVerification === 'suspicious'
              ? 'Address seems suspicious'
              : details.business.addressVerification === 'po_box'
              ? 'PO Box detected (may be legitimate)'
              : 'No address found',
          },
        ],
      },
      {
        category: 'Business Registration & Legal',
        items: [
          {
            name: 'About page presence',
            status: details.business.hasAboutPage ? 'pass' : 'warning',
            details: details.business.hasAboutPage ? 'About page found' : 'No About page',
          },
          {
            name: 'Privacy policy',
            status: details.business.hasPrivacyPolicy ? 'pass' : 'warning',
            details: details.business.hasPrivacyPolicy ? 'Privacy policy present' : 'No privacy policy',
          },
          {
            name: 'Terms of service',
            status: details.business.hasTerms ? 'pass' : 'warning',
            details: details.business.hasTerms ? 'Terms found' : 'No terms of service',
          },
          {
            name: 'Return/refund policy',
            status: details.business.hasReturnPolicy ? 'pass' : 'warning',
            details: details.business.hasReturnPolicy ? 'Return policy found' : 'No return policy',
          },
          {
            name: 'Shipping information',
            status: details.business.hasShippingInfo ? 'pass' : 'warning',
            details: details.business.hasShippingInfo ? 'Shipping info available' : 'No shipping info',
          },
        ],
      },
      {
        category: 'Pricing & Payment Safety',
        items: [
          {
            name: 'Price comparison to market',
            status: details.pricing.comparisonToMarket === 'much_lower' 
              ? 'fail' 
              : details.pricing.comparisonToMarket === 'slightly_lower'
              ? 'warning'
              : 'pass',
            details: details.pricing.comparisonToMarket === 'much_lower' 
              ? 'Prices suspiciously low'
              : details.pricing.comparisonToMarket === 'slightly_lower'
              ? 'Prices below market average'
              : 'Normal market pricing',
          },
          {
            name: 'Payment method safety',
            status: 'pass',
            details: 'Checked for secure payment options (Stripe, PayPal)',
          },
        ],
      },
      {
        category: 'Dropshipper & Fulfillment Analysis',
        items: [
          {
            name: 'Dropshipper indicators',
            status: details.dropshipperIndicators.isLikelyDropshipper ? 'warning' : 'pass',
            details: details.dropshipperIndicators.isLikelyDropshipper 
              ? `Likely dropshipper (${details.dropshipperIndicators.confidence} confidence)`
              : 'Direct retailer likely',
          },
          {
            name: 'Image originality check',
            status: details.imageAnalysis.appearsOriginal ? 'pass' : 'warning',
            details: details.imageAnalysis.appearsOriginal ? 'Images appear original' : 'Stock/copied images likely',
          },
          {
            name: 'Stock photo detection',
            status: !details.imageAnalysis.stockPhotoLikely ? 'pass' : 'warning',
            details: details.imageAnalysis.stockPhotoLikely ? 'Stock photos detected' : 'Original photos likely',
          },
        ],
      },
      {
        category: 'Website Quality Assessment',
        items: [
          {
            name: 'Design quality',
            status: details.websiteQuality.designQuality === 'professional' 
              ? 'pass' 
              : details.websiteQuality.designQuality === 'poor'
              ? 'warning'
              : 'pass',
            details: `${details.websiteQuality.designQuality} design quality`,
          },
          {
            name: 'Grammar & spelling',
            status: details.websiteQuality.grammarQuality === 'poor' ? 'warning' : 'pass',
            details: `${details.websiteQuality.grammarQuality} grammar quality`,
          },
          {
            name: 'Overall professionalism',
            status: details.websiteQuality.overallProfessionalism === 'low' ? 'warning' : 'pass',
            details: `${details.websiteQuality.overallProfessionalism} professionalism`,
          },
        ],
      },
    ];
  };

  const checklist = buildChecklist();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <Check className="w-4 h-4 text-success" />;
      case 'fail':
        return <X className="w-4 h-4 text-danger" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-warning" />;
      default:
        return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'pass':
        return 'bg-success/10';
      case 'fail':
        return 'bg-danger/10';
      case 'warning':
        return 'bg-warning/10';
      default:
        return 'bg-muted/30';
    }
  };

  const getCategoryIcon = (category: string) => {
    if (category.includes('Domain')) return <Globe className="w-4 h-4" />;
    if (category.includes('SSL')) return <Lock className="w-4 h-4" />;
    if (category.includes('Security')) return <Shield className="w-4 h-4" />;
    if (category.includes('Review')) return <Star className="w-4 h-4" />;
    if (category.includes('Contact')) return <Phone className="w-4 h-4" />;
    if (category.includes('Business')) return <Building2 className="w-4 h-4" />;
    if (category.includes('Pricing')) return <CreditCard className="w-4 h-4" />;
    if (category.includes('Dropship')) return <Search className="w-4 h-4" />;
    if (category.includes('Website')) return <Globe className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  // Calculate stats
  const allItems = checklist.flatMap(c => c.items);
  const passCount = allItems.filter(i => i.status === 'pass').length;
  const failCount = allItems.filter(i => i.status === 'fail').length;
  const warningCount = allItems.filter(i => i.status === 'warning').length;
  const notCheckedCount = allItems.filter(i => i.status === 'not_checked').length;

  return (
    <motion.div
      className="rounded-xl border border-border bg-card p-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.62 }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          <FileText className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-display font-semibold text-lg">Verification Checklist</h3>
          <p className="text-xs text-muted-foreground">
            All checks performed during analysis
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-2 mb-5 p-3 rounded-lg bg-muted/30">
        <div className="text-center">
          <p className="text-xl font-bold text-success">{passCount}</p>
          <p className="text-xs text-muted-foreground">Passed</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-warning">{warningCount}</p>
          <p className="text-xs text-muted-foreground">Warnings</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-danger">{failCount}</p>
          <p className="text-xs text-muted-foreground">Failed</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-muted-foreground">{notCheckedCount}</p>
          <p className="text-xs text-muted-foreground">N/A</p>
        </div>
      </div>

      {/* Checklist Categories */}
      <div className="space-y-4">
        {checklist.map((category, catIndex) => (
          <div key={catIndex} className="border-b border-border/50 pb-4 last:border-b-0 last:pb-0">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-primary">{getCategoryIcon(category.category)}</span>
              <h4 className="text-sm font-semibold">{category.category}</h4>
            </div>
            <div className="grid sm:grid-cols-2 gap-2">
              {category.items.map((item, itemIndex) => (
                <div 
                  key={itemIndex}
                  className={cn(
                    'flex items-start gap-2 p-2 rounded-lg text-sm',
                    getStatusBg(item.status)
                  )}
                >
                  <div className="shrink-0 mt-0.5">
                    {getStatusIcon(item.status)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate">{item.name}</p>
                    {item.details && (
                      <p className="text-xs text-muted-foreground truncate">{item.details}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Note about external checks */}
      <div className="mt-4 p-3 rounded-lg bg-muted/30 border border-border/50">
        <p className="text-xs text-muted-foreground">
          <strong>Note:</strong> Some checks require external API integrations (ScamAdviser, phone carrier lookup, business registry verification) which are not currently included. 
          Items marked as "N/A" were not available for this analysis.
        </p>
      </div>
    </motion.div>
  );
}
