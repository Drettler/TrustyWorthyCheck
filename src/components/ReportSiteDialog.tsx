import { useState } from 'react';
import { motion } from 'framer-motion';
import { Flag, Send, ExternalLink, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ReportSiteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
  trustScore?: number;
  verdict?: 'safe' | 'caution' | 'danger';
}

type ReportMode = 'report' | 'feedback';

const reportReasons = [
  { id: 'fake_store', label: 'Fake online store', emoji: '🛒' },
  { id: 'phishing', label: 'Phishing / credential theft', emoji: '🎣' },
  { id: 'scam', label: 'Scam or fraud', emoji: '💰' },
  { id: 'counterfeit', label: 'Counterfeit products', emoji: '🏷️' },
  { id: 'malware', label: 'Malware / virus', emoji: '🦠' },
  { id: 'other', label: 'Other suspicious activity', emoji: '⚠️' },
];

const feedbackReasons = [
  { id: 'false_positive', label: 'False positive - site is safe', emoji: '✅', description: 'This site was incorrectly flagged as dangerous' },
  { id: 'false_negative', label: 'False negative - site is unsafe', emoji: '🚨', description: 'This site was incorrectly marked as safe' },
];

export function ReportSiteDialog({ open, onOpenChange, url, trustScore, verdict }: ReportSiteDialogProps) {
  const [mode, setMode] = useState<ReportMode>('report');
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [selectedFeedback, setSelectedFeedback] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const resetForm = () => {
    setSelectedReasons([]);
    setSelectedFeedback(null);
    setEmail('');
    setDetails('');
    setMode('report');
  };

  const toggleReason = (reasonId: string) => {
    setSelectedReasons(prev =>
      prev.includes(reasonId)
        ? prev.filter(id => id !== reasonId)
        : [...prev, reasonId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const reasons = mode === 'feedback' 
      ? (selectedFeedback ? [selectedFeedback] : [])
      : selectedReasons;
    
    if (reasons.length === 0) {
      toast({
        title: mode === 'feedback' ? 'Please select feedback type' : 'Please select a reason',
        description: mode === 'feedback' 
          ? 'Choose whether this is a false positive or false negative.'
          : 'Choose at least one reason for reporting this site.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.functions.invoke('submit-report', {
        body: {
          url,
          reasons,
          details: details || null,
          trustScore: trustScore || null,
          verdict: verdict || null,
          feedbackType: mode === 'feedback' ? selectedFeedback : null,
        },
      });

      if (error) throw error;

      toast({
        title: mode === 'feedback' ? '📝 Feedback Submitted' : '🛡️ Report Submitted',
        description: mode === 'feedback' 
          ? 'Thank you! Your feedback helps improve our accuracy.'
          : 'Thank you for helping keep the internet safer!',
      });
      
      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error('Submit error:', error);
      toast({
        title: 'Submission Failed',
        description: 'Could not submit. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFeedbackMode = mode === 'feedback';

  return (
    <Dialog open={open} onOpenChange={(open) => { if (!open) resetForm(); onOpenChange(open); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isFeedbackMode ? 'bg-primary/10' : 'bg-danger/10'}`}>
              {isFeedbackMode ? (
                <ThumbsUp className="w-5 h-5 text-primary" />
              ) : (
                <Flag className="w-5 h-5 text-danger" />
              )}
            </div>
            <div>
              <DialogTitle className="font-display">
                {isFeedbackMode ? 'Report Incorrect Score' : 'Report Suspicious Site'}
              </DialogTitle>
              <DialogDescription className="text-xs mt-0.5">
                {isFeedbackMode 
                  ? 'Help us improve our accuracy'
                  : 'Help protect others from potential fraud'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Mode Toggle Tabs */}
        <div className="flex gap-1 p-1 bg-muted/50 rounded-lg">
          <button
            type="button"
            onClick={() => setMode('report')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${
              mode === 'report'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Flag className="w-4 h-4" />
            Report Scam
          </button>
          <button
            type="button"
            onClick={() => setMode('feedback')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${
              mode === 'feedback'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <ThumbsDown className="w-4 h-4" />
            Wrong Score
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* URL Display */}
          <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
            <p className="text-xs text-muted-foreground mb-1">
              {isFeedbackMode ? 'Providing feedback for:' : 'Reporting:'}
            </p>
            <p className="text-sm font-medium text-foreground truncate">{url}</p>
            {trustScore !== undefined && (
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-muted-foreground">
                  Trust Score: <span className={trustScore < 50 ? 'text-danger' : trustScore < 70 ? 'text-warning' : 'text-success'}>{trustScore}/100</span>
                </p>
                {verdict && (
                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                    verdict === 'safe' ? 'bg-success/10 text-success' :
                    verdict === 'caution' ? 'bg-warning/10 text-warning' :
                    'bg-danger/10 text-danger'
                  }`}>
                    {verdict.charAt(0).toUpperCase() + verdict.slice(1)}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Feedback Mode: False Positive / Negative Selection */}
          {isFeedbackMode ? (
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                What's wrong with the score?
              </label>
              <div className="space-y-2">
                {feedbackReasons.map(reason => (
                  <button
                    key={reason.id}
                    type="button"
                    onClick={() => setSelectedFeedback(reason.id)}
                    className={`w-full flex items-start gap-3 p-3 rounded-lg border text-left transition-all ${
                      selectedFeedback === reason.id
                        ? reason.id === 'false_positive' 
                          ? 'bg-success/10 border-success/40' 
                          : 'bg-danger/10 border-danger/40'
                        : 'bg-card border-border hover:border-primary/40'
                    }`}
                  >
                    <span className="text-lg">{reason.emoji}</span>
                    <div>
                      <p className={`text-sm font-medium ${
                        selectedFeedback === reason.id
                          ? reason.id === 'false_positive' ? 'text-success' : 'text-danger'
                          : 'text-foreground'
                      }`}>
                        {reason.label}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {reason.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Report Mode: Reason Selection */
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Why are you reporting this site?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {reportReasons.map(reason => (
                  <button
                    key={reason.id}
                    type="button"
                    onClick={() => toggleReason(reason.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-lg border text-left text-sm transition-all ${
                      selectedReasons.includes(reason.id)
                        ? 'bg-danger/10 border-danger/40 text-danger'
                        : 'bg-card border-border hover:border-primary/40 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <span>{reason.emoji}</span>
                    <span className="truncate">{reason.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Additional Details */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              {isFeedbackMode ? 'Why do you think the score is wrong?' : 'Additional details'} (optional)
            </label>
            <Textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder={isFeedbackMode 
                ? "Explain why you believe this site was scored incorrectly..."
                : "Describe what happened or what made this site suspicious..."}
              className="h-20 resize-none"
              maxLength={500}
            />
          </div>

          {/* Email for follow-up */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Your email (optional)
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="For follow-up on your submission"
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant={isFeedbackMode ? "default" : "destructive"}
              disabled={isSubmitting || (isFeedbackMode ? !selectedFeedback : selectedReasons.length === 0)}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Send className="w-4 h-4" />
                  </motion.div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  {isFeedbackMode ? 'Submit Feedback' : 'Submit Report'}
                </>
              )}
            </Button>
          </div>

          <div className="flex flex-col items-center gap-2">
            <p className="text-xs text-muted-foreground">
              {isFeedbackMode 
                ? 'Feedback is anonymous and helps improve our scoring accuracy.'
                : 'Reports are anonymous and help improve our scam detection.'}
            </p>
            <Link 
              to="/recent-reports" 
              className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
              onClick={() => onOpenChange(false)}
            >
              <ExternalLink className="w-3 h-3" />
              View recently reported sites
            </Link>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
