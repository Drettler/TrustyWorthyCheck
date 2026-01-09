import { useState } from 'react';
import { motion } from 'framer-motion';
import { Flag, Send, ExternalLink } from 'lucide-react';
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
}

const reportReasons = [
  { id: 'fake_store', label: 'Fake online store', emoji: '🛒' },
  { id: 'phishing', label: 'Phishing / credential theft', emoji: '🎣' },
  { id: 'scam', label: 'Scam or fraud', emoji: '💰' },
  { id: 'counterfeit', label: 'Counterfeit products', emoji: '🏷️' },
  { id: 'malware', label: 'Malware / virus', emoji: '🦠' },
  { id: 'other', label: 'Other suspicious activity', emoji: '⚠️' },
];

export function ReportSiteDialog({ open, onOpenChange, url, trustScore }: ReportSiteDialogProps) {
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [email, setEmail] = useState('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const toggleReason = (reasonId: string) => {
    setSelectedReasons(prev =>
      prev.includes(reasonId)
        ? prev.filter(id => id !== reasonId)
        : [...prev, reasonId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedReasons.length === 0) {
      toast({
        title: 'Please select a reason',
        description: 'Choose at least one reason for reporting this site.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.functions.invoke('submit-report', {
        body: {
          url,
          reasons: selectedReasons,
          details: details || null,
          trustScore: trustScore || null,
        },
      });

      if (error) throw error;

      toast({
        title: '🛡️ Report Submitted',
        description: 'Thank you for helping keep the internet safer!',
      });
      
      // Reset form
      setSelectedReasons([]);
      setEmail('');
      setDetails('');
      onOpenChange(false);
    } catch (error) {
      console.error('Submit error:', error);
      toast({
        title: 'Submission Failed',
        description: 'Could not submit report. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-danger/10 flex items-center justify-center">
              <Flag className="w-5 h-5 text-danger" />
            </div>
            <div>
              <DialogTitle className="font-display">Report Suspicious Site</DialogTitle>
              <DialogDescription className="text-xs mt-0.5">
                Help protect others from potential fraud
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* URL Display */}
          <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
            <p className="text-xs text-muted-foreground mb-1">Reporting:</p>
            <p className="text-sm font-medium text-foreground truncate">{url}</p>
            {trustScore !== undefined && (
              <p className="text-xs text-muted-foreground mt-1">
                Trust Score: <span className={trustScore < 50 ? 'text-danger' : trustScore < 70 ? 'text-warning' : 'text-success'}>{trustScore}/100</span>
              </p>
            )}
          </div>

          {/* Reason Selection */}
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

          {/* Additional Details */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Additional details (optional)
            </label>
            <Textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Describe what happened or what made this site suspicious..."
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
              placeholder="For follow-up on your report"
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
              variant="destructive"
              disabled={isSubmitting || selectedReasons.length === 0}
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
                  Submit Report
                </>
              )}
            </Button>
          </div>

          <div className="flex flex-col items-center gap-2">
            <p className="text-xs text-muted-foreground">
              Reports are anonymous and help improve our scam detection.
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
