import { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { analyzeUrl, type AnalysisResult } from '@/lib/api/url-check';
import {
  KNOWN_GOOD,
  KNOWN_BAD,
  KNOWN_CAUTION,
  type CalibrationEntry,
  type ExpectedVerdict,
} from '@/lib/calibration-set';
import { CheckCircle2, XCircle, Loader2, PlayCircle } from 'lucide-react';

type Status = 'pending' | 'running' | 'done' | 'error';

interface RowResult {
  entry: CalibrationEntry;
  status: Status;
  score?: number;
  verdict?: ExpectedVerdict;
  error?: string;
  pass?: boolean;
  reason?: string;
}

const ALL: CalibrationEntry[] = [...KNOWN_GOOD, ...KNOWN_CAUTION, ...KNOWN_BAD];

function evaluate(entry: CalibrationEntry, r: AnalysisResult): { pass: boolean; reason: string } {
  const verdictOk = r.verdict === entry.expected;
  const minOk = entry.expectedScoreMin === undefined || r.trustScore >= entry.expectedScoreMin;
  const maxOk = entry.expectedScoreMax === undefined || r.trustScore <= entry.expectedScoreMax;
  const pass = verdictOk && minOk && maxOk;
  const reasons: string[] = [];
  if (!verdictOk) reasons.push(`verdict ${r.verdict} ≠ ${entry.expected}`);
  if (!minOk) reasons.push(`score ${r.trustScore} < min ${entry.expectedScoreMin}`);
  if (!maxOk) reasons.push(`score ${r.trustScore} > max ${entry.expectedScoreMax}`);
  return { pass, reason: reasons.join('; ') || 'within tolerance' };
}

export default function Calibrate() {
  const [rows, setRows] = useState<RowResult[]>(
    ALL.map((entry) => ({ entry, status: 'pending' as Status }))
  );
  const [running, setRunning] = useState(false);

  const runAll = async () => {
    setRunning(true);
    const next = ALL.map((entry) => ({ entry, status: 'pending' as Status }));
    setRows(next);

    for (let i = 0; i < ALL.length; i++) {
      const entry = ALL[i];
      setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, status: 'running' } : r)));
      try {
        const result = await analyzeUrl(entry.domain);
        const evalRes = evaluate(entry, result);
        setRows((prev) =>
          prev.map((r, idx) =>
            idx === i
              ? {
                  ...r,
                  status: 'done',
                  score: result.trustScore,
                  verdict: result.verdict,
                  pass: evalRes.pass,
                  reason: evalRes.reason,
                }
              : r
          )
        );
      } catch (err: any) {
        setRows((prev) =>
          prev.map((r, idx) =>
            idx === i
              ? {
                  ...r,
                  status: 'error',
                  error: err?.message || 'Failed',
                }
              : r
          )
        );
      }
      // Small pause to avoid hammering rate limits.
      await new Promise((res) => setTimeout(res, 400));
    }
    setRunning(false);
  };

  const done = rows.filter((r) => r.status === 'done');
  const passed = done.filter((r) => r.pass).length;
  const failed = done.filter((r) => !r.pass).length;
  const errored = rows.filter((r) => r.status === 'error').length;

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(rows, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `calibration-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container px-4 py-12 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold mb-2">Scoring Calibration</h1>
          <p className="text-muted-foreground">
            Runs the live analyzer against a curated set of known-good and known-bad domains so you
            can tune thresholds and floors. Edit the corpus in{' '}
            <code className="text-xs bg-muted px-1.5 py-0.5 rounded">src/lib/calibration-set.ts</code>.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 items-center mb-6">
          <Button onClick={runAll} disabled={running} size="lg">
            {running ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Running…
              </>
            ) : (
              <>
                <PlayCircle className="w-4 h-4 mr-2" /> Run calibration ({ALL.length})
              </>
            )}
          </Button>
          <Button variant="outline" onClick={exportJson} disabled={running || done.length === 0}>
            Export results
          </Button>
          {done.length > 0 && (
            <div className="flex gap-4 text-sm ml-auto">
              <span className="text-success font-medium">✓ {passed} pass</span>
              <span className="text-destructive font-medium">✗ {failed} fail</span>
              {errored > 0 && <span className="text-warning font-medium">! {errored} error</span>}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="p-3 font-medium">Domain</th>
                <th className="p-3 font-medium">Expected</th>
                <th className="p-3 font-medium">Score</th>
                <th className="p-3 font-medium">Verdict</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-t border-border">
                  <td className="p-3 font-mono text-xs">{r.entry.domain}</td>
                  <td className="p-3">
                    <span className="capitalize">{r.entry.expected}</span>
                    {(r.entry.expectedScoreMin !== undefined || r.entry.expectedScoreMax !== undefined) && (
                      <div className="text-xs text-muted-foreground">
                        {r.entry.expectedScoreMin !== undefined && `≥${r.entry.expectedScoreMin}`}
                        {r.entry.expectedScoreMin !== undefined && r.entry.expectedScoreMax !== undefined && ' '}
                        {r.entry.expectedScoreMax !== undefined && `≤${r.entry.expectedScoreMax}`}
                      </div>
                    )}
                  </td>
                  <td className="p-3 font-mono">{r.score ?? '—'}</td>
                  <td className="p-3 capitalize">{r.verdict ?? '—'}</td>
                  <td className="p-3">
                    {r.status === 'pending' && <span className="text-muted-foreground">Pending</span>}
                    {r.status === 'running' && (
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    )}
                    {r.status === 'done' && r.pass && (
                      <span className="inline-flex items-center gap-1 text-success">
                        <CheckCircle2 className="w-4 h-4" /> Pass
                      </span>
                    )}
                    {r.status === 'done' && !r.pass && (
                      <span className="inline-flex items-center gap-1 text-destructive">
                        <XCircle className="w-4 h-4" /> Fail
                      </span>
                    )}
                    {r.status === 'error' && (
                      <span className="text-warning">Error</span>
                    )}
                  </td>
                  <td className="p-3 text-xs text-muted-foreground">
                    {r.error ?? r.reason ?? r.entry.notes ?? ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-muted-foreground mt-4">
          Note: each run consumes a daily check quota and calls the live analyzer. Cached results
          (24h) will return instantly. Bump <code>ANALYSIS_CACHE_VERSION</code> in the edge function
          to force re-analysis after scoring changes.
        </p>
      </main>
      <Footer />
    </div>
  );
}
