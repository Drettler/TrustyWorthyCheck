import { motion } from 'framer-motion';
import { Package, AlertTriangle, XCircle, TrendingDown, MapPin, DollarSign } from 'lucide-react';

interface DropshipperIndicators {
  isLikelyDropshipper: boolean;
  confidence: 'high' | 'medium' | 'low';
  reasons: string[];
}

interface DropshipperWarningBannerProps {
  dropshipperIndicators?: DropshipperIndicators;
}

export function DropshipperWarningBanner({ dropshipperIndicators }: DropshipperWarningBannerProps) {
  if (!dropshipperIndicators) return null;
  if (!dropshipperIndicators.isLikelyDropshipper) return null;
  if (dropshipperIndicators.confidence !== 'high' && dropshipperIndicators.confidence !== 'medium') return null;

  const isMedium = dropshipperIndicators.confidence === 'medium';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-xl overflow-hidden border-2 border-warning bg-warning/5"
    >
      <div className="bg-warning px-4 py-2 flex items-center gap-2">
        <Package className="w-5 h-5 text-warning-foreground" />
        <span className="font-bold text-warning-foreground text-sm uppercase tracking-wide">
          ⚠️ {isMedium ? 'Possible Dropshipper Detected' : 'Likely Dropshipper Detected'}
        </span>
      </div>
      <div className="p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center">
            <TrendingDown className="w-5 h-5 text-warning" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-foreground font-medium mb-1">
              This website shows strong signs of being a dropshipping operation
            </p>
            <p className="text-xs text-muted-foreground">
              Dropshippers resell cheap products (often from AliExpress/Temu) at heavily inflated "discounted" prices. Products may take weeks to arrive and quality is often poor.
            </p>
          </div>
        </div>

        {/* Reasons */}
        {dropshipperIndicators.reasons.length > 0 && (
          <div className="bg-background/80 rounded-lg p-3 border border-border/50">
            <h4 className="font-semibold text-sm text-foreground mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning" />
              Why We Flagged This:
            </h4>
            <ul className="text-xs text-muted-foreground space-y-1.5">
              {dropshipperIndicators.reasons.slice(0, 5).map((reason, i) => (
                <li key={i} className="flex items-start gap-2">
                  <XCircle className="w-3 h-3 mt-0.5 text-warning flex-shrink-0" />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="bg-background/80 rounded-lg p-3 border border-border/50">
          <h4 className="font-semibold text-sm text-foreground mb-2 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-warning" />
            Before You Buy:
          </h4>
          <ul className="text-xs text-muted-foreground space-y-1.5">
            <li className="flex items-start gap-2">
              <MapPin className="w-3 h-3 mt-0.5 text-warning flex-shrink-0" />
              <span><strong>Search the product image</strong> on Google — you may find it much cheaper elsewhere</span>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="w-3 h-3 mt-0.5 text-warning flex-shrink-0" />
              <span><strong>Expect long shipping times</strong> (2–6 weeks) and potential customs fees</span>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="w-3 h-3 mt-0.5 text-warning flex-shrink-0" />
              <span><strong>Returns may be difficult</strong> — you might have to ship items back overseas at your own cost</span>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="w-3 h-3 mt-0.5 text-warning flex-shrink-0" />
              <span><strong>Use PayPal or credit card</strong> for buyer protection if you do purchase</span>
            </li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
}
