import { motion, AnimatePresence } from "framer-motion";
import { History, X, ExternalLink, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { HistoryEntry } from "@/hooks/use-url-history";
import { formatDistanceToNow } from "date-fns";

interface HistoryPanelProps {
  history: HistoryEntry[];
  onSelect: (entry: HistoryEntry) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
}

function getScoreColor(score: number) {
  if (score >= 70) return "text-status-safe";
  if (score >= 40) return "text-status-warning";
  return "text-status-danger";
}

function getScoreBg(score: number) {
  if (score >= 70) return "bg-status-safe/20";
  if (score >= 40) return "bg-status-warning/20";
  return "bg-status-danger/20";
}

export function HistoryPanel({ history, onSelect, onRemove, onClear }: HistoryPanelProps) {
  if (history.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-xl p-6 text-center"
      >
        <History className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">No URLs checked yet</p>
        <p className="text-sm text-muted-foreground/70 mt-1">Your history will appear here</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-xl overflow-hidden"
    >
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-primary" />
          <h3 className="font-display font-semibold">Recent Checks</h3>
          <span className="text-sm text-muted-foreground">({history.length})</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="text-muted-foreground hover:text-status-danger"
        >
          <Trash2 className="w-4 h-4 mr-1" />
          Clear All
        </Button>
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {history.map((entry, index) => (
            <motion.div
              key={entry.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              transition={{ delay: index * 0.03 }}
              className="group flex items-center gap-4 p-4 border-b border-border/50 hover:bg-primary/5 transition-colors cursor-pointer"
              onClick={() => onSelect(entry)}
            >
              {/* Score Badge */}
              <div
                className={`flex-shrink-0 w-12 h-12 rounded-lg ${getScoreBg(entry.trustScore)} flex items-center justify-center`}
              >
                <span className={`font-display font-bold ${getScoreColor(entry.trustScore)}`}>
                  {entry.trustScore}
                </span>
              </div>

              {/* URL Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium truncate">{entry.url}</p>
                  <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${getScoreBg(entry.trustScore)} ${getScoreColor(entry.trustScore)}`}
                  >
                    {entry.verdict}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(entry.checkedAt), { addSuffix: true })}
                  </span>
                </div>
              </div>

              {/* Remove Button */}
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(entry.id);
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
