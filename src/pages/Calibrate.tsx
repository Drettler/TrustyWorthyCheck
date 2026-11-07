import { useEffect, useMemo, useRef, useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { analyzeUrlWithMetadata, type AnalysisResult } from '@/lib/api/url-check';
import {
  CALIBRATION_ENTRIES,
  CALIBRATION_REVIEW_DAYS,
  CALIBRATION_VERSION,
  isCalibrationReviewDue,
  type CalibrationCategory,
  type CalibrationEntry,
  type ExpectedVerdict,
} from '@/lib/calibration-set';
import { CheckCircle2, XCircle, Loader2, PlayCircle, Square, RotateCcw, Clock3 } from 'lucide-react';

type Status = 'pending' | 'running' | 'done' | 'error';

interface RowResult {
  entry: CalibrationEntry;
  status: Status;
  score?: number;
  verdict?: ExpectedVerdict;
  cached?: boolean;
  error?: string;
  pass?: boolean;
  reason?: string;
}

const STORAGE_KEY = `twc-calibration-results-${CALIBRATION_VERSION}`;
const CATEGORIES = Array.from(new Set(CALIBRATION_ENTRIES.map((entry) => entry.category))).sort();

function evaluate(entry: CalibrationEntry, result: AnalysisResult): { pass: boolean; reason: string } {
  const verdictOk = result.verdict === entry.expected;
  const minOk = entry.expectedScoreMin === undefined || result.trustScore >= entry.expectedScoreMin;
  const maxOk = entry.expectedScoreMax === undefined || result.trustScore <= entry.expectedScoreMax;
  const reasons: string[] = [];
  if (!verdictOk) reasons.push(`verdict ${result.verdict} ≠ ${entry.expected}`);
  if (!minOk) reasons.push(`score ${result.trustScore} < min ${entry.expectedScoreMin}`);
  if (!maxOk) reasons.push(`score ${result.trustScore} > max ${entry.expectedScoreMax}`);
  return { pass: verdictOk && minOk && maxOk, reason: reasons.join('; ') || 'Within tolerance' };
}

function initialRows(): RowResult[] {
  const pending = CALIBRATION_ENTRIES.map((entry) => ({ entry, status: 'pending' as Status }));
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (!saved?.rows || !Array.isArray(saved.rows)) return pending;
    return pending.map((row) => {
      const previous = saved.rows.find((item: RowResult) => item.entry?.id === row.entry.id);
      return previous && (previous.status === 'done' || previous.status === 'error')
        ? { ...previous, entry: row.entry }
        : row;
    });
  } catch {
    return pending;
  }
}

function isTemporaryFailure(error: unknown): boolean {
  const candidate = error as { type?: string; message?: string };
  return candidate?.type === 'scrape_failed' ||
    candidate?.type === 'ssl_error' ||
    /timeout|temporar|network|failed to fetch|502|503|504/i.test(candidate?.message || '');
}

export default function Calibrate() {
  const [rows, setRows] = useState<RowResult[]>(initialRows);
  const [running, setRunning] = useState(false);
  const [category, setCategory] = useState<'all' | CalibrationCategory>('all');
  const [lastRun, setLastRun] = useState<string | null>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')?.lastRun || null;
    } catch {
      return null;
    }
  });
  const runId = useRef(0);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ lastRun, rows }));
  }, [rows, lastRun]);

  const visibleRows = useMemo(
    () => rows.filter((row) => category === 'all' || row.entry.category === category),
    [rows, category],
  );
  const done = rows.filter((row) => row.status === 'done');
  const passed = done.filter((row) => row.pass).length;
  const failed = done.filter((row) => !row.pass).length;
  const errored = rows.filter((row) => row.status === 'error').length;
  const retryable = rows.filter((row) => (row.status === 'done' && !row.pass) || row.status === 'error');
  const reviewDue = CALIBRATION_ENTRIES.filter((entry) => isCalibrationReviewDue(entry)).length;

  const runEntries = async (entries: CalibrationEntry[]) => {
    if (!entries.length || running) return;
    const thisRun = ++runId.current;
    setRunning(true);

    for (const entry of entries) {
      if (runId.current !== thisRun) break;
      setRows((previous) => previous.map((row) =>
        row.entry.id === entry.id ? { ...row, status: 'running', error: undefined } : row));

      let completed = false;
      for (let attempt = 0; attempt < 2 && !completed; attempt++) {
        try {
          const { result, cached } = await analyzeUrlWithMetadata(entry.url);
          if (runId.current !== thisRun) break;
          const evaluation = evaluate(entry, result);
          setRows((previous) => previous.map((row) => row.entry.id === entry.id ? {
            ...row,
            status: 'done',
            score: result.trustScore,
            verdict: result.verdict,
            cached,
            pass: evaluation.pass,
            reason: evaluation.reason,
            error: undefined,
          } : row));
          completed = true;
        } catch (error: any) {
          if (isTemporaryFailure(error) && attempt === 0) {
            await new Promise((resolve) => setTimeout(resolve, 1200));
            continue;
          }
          if (runId.current !== thisRun) break;
          setRows((previous) => previous.map((row) => row.entry.id === entry.id ? {
            ...row,
            status: 'error',
            error: error?.message || 'Analysis failed',
            pass: undefined,
          } : row));
          completed = true;
        }
      }
      setLastRun(new Date().toISOString());
      await new Promise((resolve) => setTimeout(resolve, 400));
    }

    if (runId.current === thisRun) setRunning(false);
  };

  const stop = () => {
    runId.current += 1;
    setRunning(false);
    setRows((previous) => previous.map((row) => row.status === 'running' ? { ...row, status: 'pending' } : row));
  };

  const exportJson = () => {
    const payload = {
      suiteVersion: CALIBRATION_VERSION,
      exportedAt: new Date().toISOString(),
      lastRun,
      summary: { passed, failed, errored, total: rows.length },
      rows,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `calibration-${CALIBRATION_VERSION}-${new Date().toISOString().split('T')[0]}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-7xl px-4 py-8 sm:py-12">
        <div className="mb-8">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">Suite {CALIBRATION_VERSION}</span>
            <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">Expectations reviewed every {CALIBRATION_REVIEW_DAYS} days</span>
          </div>
          <h1 className="mb-2 font-display text-3xl font-bold">Scoring Calibration</h1>
          <p className="max-w-3xl text-muted-foreground">
            Test changing live websites by scenario while deterministic protocol, impersonation, storefront,
            and confidence fixtures cover the rules that must remain stable. Errors are separated from scoring failures.
          </p>
        </div>

        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border bg-card p-4"><div className="text-2xl font-bold">{rows.length}</div><div className="text-sm text-muted-foreground">Live controls</div></div>
          <div className="rounded-xl border bg-card p-4"><div className="text-2xl font-bold text-success">{passed}</div><div className="text-sm text-muted-foreground">Passing</div></div>
          <div className="rounded-xl border bg-card p-4"><div className="text-2xl font-bold text-destructive">{failed}</div><div className="text-sm text-muted-foreground">Scoring failures</div></div>
          <div className="rounded-xl border bg-card p-4"><div className="text-2xl font-bold text-warning">{errored + reviewDue}</div><div className="text-sm text-muted-foreground">{errored} errors · {reviewDue} reviews due</div></div>
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-3">
          <select
            aria-label="Filter calibration category"
            value={category}
            onChange={(event) => setCategory(event.target.value as 'all' | CalibrationCategory)}
            disabled={running}
            className="h-11 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="all">All scenarios</option>
            {CATEGORIES.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          {running ? (
            <Button onClick={stop} variant="destructive" size="lg"><Square className="mr-2 h-4 w-4" /> Stop</Button>
          ) : (
            <Button onClick={() => runEntries(visibleRows.map((row) => row.entry))} size="lg">
              <PlayCircle className="mr-2 h-4 w-4" /> Run {category === 'all' ? 'all' : category} ({visibleRows.length})
            </Button>
          )}
          <Button variant="outline" onClick={() => runEntries(retryable.map((row) => row.entry))} disabled={running || retryable.length === 0}>
            <RotateCcw className="mr-2 h-4 w-4" /> Retry failures/errors ({retryable.length})
          </Button>
          <Button variant="outline" onClick={exportJson} disabled={running || done.length === 0}>Export results</Button>
        </div>

        <div className="mb-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
          {lastRun && <span className="inline-flex items-center gap-1"><Clock3 className="h-4 w-4" /> Last activity: {new Date(lastRun).toLocaleString()}</span>}
          <span>“Cached” means the analyzer’s normal 24-hour result was used.</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[980px] text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="p-3 font-medium">Scenario</th>
                <th className="p-3 font-medium">Expected</th>
                <th className="p-3 font-medium">Observed</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium">Reason / expectation</th>
                <th className="p-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row) => {
                const due = isCalibrationReviewDue(row.entry);
                return (
                  <tr key={row.entry.id} className="border-t border-border align-top">
                    <td className="p-3">
                      <div className="font-mono text-xs">{row.entry.url}</div>
                      <div className="mt-1 flex flex-wrap gap-1">
                        <span className="rounded bg-muted px-1.5 py-0.5 text-xs capitalize text-muted-foreground">{row.entry.category}</span>
                        {due && <span className="rounded bg-warning/10 px-1.5 py-0.5 text-xs text-warning">Review due</span>}
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="capitalize">{row.entry.expected}</span>
                      <div className="text-xs text-muted-foreground">
                        {row.entry.expectedScoreMin !== undefined && `≥ ${row.entry.expectedScoreMin}`}
                        {row.entry.expectedScoreMin !== undefined && row.entry.expectedScoreMax !== undefined && ' · '}
                        {row.entry.expectedScoreMax !== undefined && `≤ ${row.entry.expectedScoreMax}`}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="font-mono">{row.score ?? '—'} <span className="capitalize">{row.verdict || ''}</span></div>
                      {row.cached !== undefined && <div className="text-xs text-muted-foreground">{row.cached ? 'Cached' : 'Fresh analysis'}</div>}
                    </td>
                    <td className="p-3">
                      {row.status === 'pending' && <span className="text-muted-foreground">Pending</span>}
                      {row.status === 'running' && <span className="inline-flex items-center gap-1"><Loader2 className="h-4 w-4 animate-spin text-primary" /> Checking</span>}
                      {row.status === 'done' && row.pass && <span className="inline-flex items-center gap-1 text-success"><CheckCircle2 className="h-4 w-4" /> Pass</span>}
                      {row.status === 'done' && !row.pass && <span className="inline-flex items-center gap-1 text-destructive"><XCircle className="h-4 w-4" /> Fail</span>}
                      {row.status === 'error' && <span className="text-warning">Site/check error</span>}
                    </td>
                    <td className="max-w-md p-3 text-xs text-muted-foreground">
                      <div>{row.error ?? row.reason ?? 'Not run'}</div>
                      <div className="mt-1">{row.entry.notes}</div>
                      <div className="mt-1">Expectation reviewed {row.entry.reviewedOn}</div>
                    </td>
                    <td className="p-3">
                      <Button variant="ghost" size="sm" disabled={running} onClick={() => runEntries([row.entry])}>Run</Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-5 rounded-xl border bg-muted/30 p-4 text-sm text-muted-foreground">
          Live sites can move, close, block scanners, or change ownership. An unavailable known-bad control is an
          error requiring corpus review—not evidence that the scorer passed. Temporary scrape failures get one retry;
          daily rate limits are never retried. Each analysis consumes the normal check quota.
        </div>
      </main>
      <Footer />
    </div>
  );
}
