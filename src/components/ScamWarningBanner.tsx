import { motion } from 'framer-motion';
import { ShieldAlert, Phone, Building2, Laptop, AlertTriangle, XCircle } from 'lucide-react';

interface ScamIndicators {
  government: {
    isLikelyScam: boolean;
    agencies: string[];
    patterns: string[];
  };
  subscription: {
    isLikelyScam: boolean;
    brands: string[];
    hasPhonePrompt: boolean;
    patterns: string[];
  };
}

interface ScamWarningBannerProps {
  scamIndicators?: ScamIndicators;
}

export function ScamWarningBanner({ scamIndicators }: ScamWarningBannerProps) {
  if (!scamIndicators) return null;

  const { government, subscription } = scamIndicators;
  const isGovScam = government?.isLikelyScam;
  const isSubScam = subscription?.isLikelyScam;

  if (!isGovScam && !isSubScam) return null;

  return (
    <div className="space-y-3">
      {/* Government Impersonation Scam Banner */}
      {isGovScam && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl overflow-hidden border-2 border-danger bg-danger/5"
        >
          <div className="bg-danger px-4 py-2 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-white" />
            <span className="font-bold text-white text-sm uppercase tracking-wide">
              🚨 Government Impersonation Scam Detected
            </span>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-danger/20 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-danger" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-foreground font-medium mb-1">
                  This website is impersonating a government agency
                  {government.agencies.length > 0 && (
                    <span className="font-bold text-danger">
                      {' '}({government.agencies.join(', ')})
                    </span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  Legitimate government agencies do NOT contact you through random websites demanding payment or personal information.
                </p>
              </div>
            </div>

            <div className="bg-background/80 rounded-lg p-3 border border-border/50">
              <h4 className="font-semibold text-sm text-foreground mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-warning" />
                What You Should Do:
              </h4>
              <ul className="text-xs text-muted-foreground space-y-1.5">
                <li className="flex items-start gap-2">
                  <XCircle className="w-3 h-3 mt-0.5 text-danger flex-shrink-0" />
                  <span><strong>Do NOT pay anything</strong> or provide personal information on this site</span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="w-3 h-3 mt-0.5 text-danger flex-shrink-0" />
                  <span><strong>Close this website immediately</strong> - it is designed to steal your money or identity</span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="w-3 h-3 mt-0.5 text-danger flex-shrink-0" />
                  <span><strong>Official government websites</strong> use .gov domains (e.g., irs.gov, dmv.gov)</span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="w-3 h-3 mt-0.5 text-danger flex-shrink-0" />
                  <span><strong>Report this scam</strong> to the FTC at reportfraud.ftc.gov</span>
                </li>
              </ul>
            </div>

            {government.patterns.length > 0 && (
              <div className="text-xs text-muted-foreground">
                <span className="font-medium">Detected patterns: </span>
                {government.patterns.slice(0, 3).join(' • ')}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Subscription/Tech Support Scam Banner */}
      {isSubScam && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl overflow-hidden border-2 border-danger bg-danger/5"
        >
          <div className="bg-danger px-4 py-2 flex items-center gap-2">
            <Laptop className="w-5 h-5 text-white" />
            <span className="font-bold text-white text-sm uppercase tracking-wide">
              🚨 Tech Support / Subscription Scam Detected
            </span>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-danger/20 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-danger" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-foreground font-medium mb-1">
                  This website is impersonating
                  {subscription.brands.length > 0 ? (
                    <span className="font-bold text-danger">
                      {' '}{subscription.brands.join(', ')}
                    </span>
                  ) : (
                    <span> a legitimate software company</span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  These scams falsely claim your subscription has expired or your computer is infected to trick you into paying.
                </p>
              </div>
            </div>

            {subscription.hasPhonePrompt && (
              <div className="bg-danger/10 rounded-lg p-3 border border-danger/30 flex items-start gap-3">
                <Phone className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-danger">
                    ⚠️ This site wants you to call a phone number
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    This is a classic tech support scam tactic. The number leads to scammers who will try to access your computer or steal your money.
                  </p>
                </div>
              </div>
            )}

            <div className="bg-background/80 rounded-lg p-3 border border-border/50">
              <h4 className="font-semibold text-sm text-foreground mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-warning" />
                What You Should Do:
              </h4>
              <ul className="text-xs text-muted-foreground space-y-1.5">
                <li className="flex items-start gap-2">
                  <XCircle className="w-3 h-3 mt-0.5 text-danger flex-shrink-0" />
                  <span><strong>Do NOT call any phone number</strong> shown on this site</span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="w-3 h-3 mt-0.5 text-danger flex-shrink-0" />
                  <span><strong>Do NOT allow remote access</strong> to your computer</span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="w-3 h-3 mt-0.5 text-danger flex-shrink-0" />
                  <span><strong>Close this website immediately</strong> - use Ctrl+W or Cmd+W</span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="w-3 h-3 mt-0.5 text-danger flex-shrink-0" />
                  <span><strong>If you have a subscription</strong>, check it directly at the official website (norton.com, mcafee.com)</span>
                </li>
              </ul>
            </div>

            {subscription.patterns.length > 0 && (
              <div className="text-xs text-muted-foreground">
                <span className="font-medium">Detected patterns: </span>
                {subscription.patterns.slice(0, 3).join(' • ')}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
