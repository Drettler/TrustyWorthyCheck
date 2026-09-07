import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, ExternalLink, Search, ShieldQuestion, ShoppingBag } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

type RiskLevel = "low" | "medium" | "high";

interface SellerResult {
  riskScore: number;
  riskLevel: RiskLevel;
  summary: string;
  redFlags: Array<{ type: string; severity: RiskLevel; description: string }>;
  positiveSignals: string[];
}

const getSellerName = (value: string) => {
  const trimmed = value.trim().replace(/^@/, "");
  try {
    const url = new URL(trimmed);
    const atSegment = url.pathname.split("/").find((part) => part.startsWith("@"));
    return atSegment?.slice(1) || url.pathname.split("/").filter(Boolean).pop() || url.hostname;
  } catch {
    return trimmed;
  }
};

export default function TikTokSellerCheck() {
  const [seller, setSeller] = useState("");
  const [bio, setBio] = useState("");
  const [product, setProduct] = useState("");
  const [price, setPrice] = useState("");
  const [result, setResult] = useState<SellerResult | null>(null);
  const [checkedWithBio, setCheckedWithBio] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const productQuery = useMemo(() => encodeURIComponent(product.trim()), [product]);
  const comparisonLinks = product.trim() ? [
    { name: "Google Shopping", href: `https://www.google.com/search?tbm=shop&q=${productQuery}` },
    { name: "Amazon", href: `https://www.amazon.com/s?k=${productQuery}` },
    { name: "Walmart", href: `https://www.walmart.com/search?q=${productQuery}` },
    { name: "Target", href: `https://www.target.com/s?searchTerm=${productQuery}` },
  ] : [];

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const username = getSellerName(seller);
    if (!username) {
      setError("Enter the seller's username, shop name, or TikTok link.");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    setCheckedWithBio(bio.trim().length > 0);
    const { data, error: invokeError } = await supabase.functions.invoke("analyze-social-seller", {
      body: { username, bio: bio.trim(), platform: "TikTok" },
    });
    if (invokeError || !data?.success) {
      setError(data?.error || "The seller analysis could not be completed. Please try again.");
    } else {
      setResult(data.data as SellerResult);
    }
    setLoading(false);
  };

  const riskLabel = !checkedWithBio ? "Not enough information" : result?.riskLevel === "high" ? "Many warning signs" : result?.riskLevel === "medium" ? "Use extra caution" : "Fewer profile warnings";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="TikTok Seller Check"
        description="Review a TikTok seller profile for warning signs and compare product prices before buying."
        canonical="https://trustworthycheck.com/tiktok-seller-check"
      />
      <Header />
      <main className="flex-1">
        <section className="border-b border-border bg-gradient-to-b from-primary/10 via-background to-background">
          <div className="container px-4 py-12 md:py-16">
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary mb-3">TikTok Shop safety</p>
              <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight">Check the seller. Compare the price.</h1>
              <p className="text-lg text-muted-foreground mt-5">Use visible seller details to identify warning signs, then check whether the deal is really competitive.</p>
            </div>
          </div>
        </section>

        <section className="container px-4 py-8 md:py-12">
          <div className="grid lg:grid-cols-[1.05fr_.95fr] gap-8 max-w-6xl mx-auto items-start">
            <form onSubmit={submit} className="rounded-2xl border bg-card p-5 md:p-7 shadow-lg space-y-5">
              <div>
                <h2 className="font-display text-2xl font-bold">Seller details</h2>
                <p className="text-sm text-muted-foreground mt-1">You can start with only a username. Adding the bio improves the preliminary check.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="seller">Seller username, shop name, or TikTok link</Label>
                <Input id="seller" value={seller} onChange={(e) => setSeller(e.target.value)} placeholder="@sellername or paste a TikTok link" autoComplete="off" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Seller bio or shop description <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Copy and paste the seller's visible bio here" rows={4} maxLength={3000} />
              </div>
              <div className="grid sm:grid-cols-[1fr_150px] gap-4">
                <div className="space-y-2"><Label htmlFor="product">Product name <span className="text-muted-foreground font-normal">(optional)</span></Label><Input id="product" value={product} onChange={(e) => setProduct(e.target.value)} placeholder="Brand and exact product" /></div>
                <div className="space-y-2"><Label htmlFor="price">TikTok price</Label><Input id="price" value={price} onChange={(e) => setPrice(e.target.value)} inputMode="decimal" placeholder="$29.99" /></div>
              </div>
              {error && <p className="text-sm text-destructive font-medium" role="alert">{error}</p>}
              <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
                <Search className="w-5 h-5 mr-2" />{loading ? "Checking visible signals..." : "Check seller signals"}
              </Button>
              <p className="text-xs text-muted-foreground text-center">Never enter your TikTok password, payment information, or private messages.</p>
            </form>

            <div className="space-y-5">
              {!result ? (
                <div className="rounded-2xl border bg-card p-6 md:p-8">
                  <ShieldQuestion className="w-10 h-10 text-primary mb-5" />
                  <h2 className="font-display text-2xl font-bold">What this check can tell you now</h2>
                  <ul className="mt-5 space-y-4 text-sm">
                    <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-success shrink-0" /><span>Whether the username resembles common impersonation or throwaway-account patterns</span></li>
                    <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-success shrink-0" /><span>Whether the visible bio contains urgency, suspicious payment requests or unsupported legitimacy claims</span></li>
                    <li className="flex gap-3"><AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" /><span>It does not yet confirm the seller's identity, reviews, fulfillment history or brand authorization</span></li>
                  </ul>
                </div>
              ) : (
                <div className="rounded-2xl border bg-card p-6 md:p-8 shadow-lg">
                  <div className="flex flex-wrap justify-between items-start gap-4">
                    <div><p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Preliminary profile check</p><h2 className="font-display text-3xl font-bold mt-1">{riskLabel}</h2></div>
                    {checkedWithBio ? (
                      <span className={`rounded-full px-3 py-1.5 text-sm font-bold ${result.riskLevel === "high" ? "bg-destructive/10 text-destructive" : result.riskLevel === "medium" ? "bg-amber-100 text-amber-800" : "bg-success/10 text-success"}`}>{result.riskScore}/100 profile risk</span>
                    ) : (
                      <span className="rounded-full px-3 py-1.5 text-sm font-bold bg-muted text-muted-foreground">Username pattern only</span>
                    )}
                  </div>
                  <p className="text-muted-foreground mt-4">{checkedWithBio ? result.summary : "The username did not match the limited suspicious patterns checked. That does not establish the seller's identity, history, customer service, product authenticity, or legitimacy."}</p>
                  {result.redFlags.length > 0 && <div className="mt-6"><h3 className="font-bold">Warning signals</h3><ul className="mt-3 space-y-3">{result.redFlags.map((flag, index) => <li key={`${flag.type}-${index}`} className="flex gap-3 text-sm"><AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" /><span>{flag.description}</span></li>)}</ul></div>}
                  {checkedWithBio && result.positiveSignals.length > 0 && <div className="mt-6"><h3 className="font-bold">Positive profile signals</h3><ul className="mt-3 space-y-3">{result.positiveSignals.map((signal, index) => <li key={index} className="flex gap-3 text-sm"><CheckCircle2 className="w-5 h-5 text-success shrink-0" /><span>{signal}</span></li>)}</ul></div>}
                  <div className="mt-6 rounded-xl bg-muted/50 p-4 text-sm"><strong>Important:</strong> This is a pattern-based screen, not proof that a seller is legitimate. Confirm reviews, return terms, platform badges and payment protections before buying.</div>
                </div>
              )}

              {comparisonLinks.length > 0 && (
                <div className="rounded-2xl border bg-card p-6">
                  <div className="flex items-center gap-3"><ShoppingBag className="w-6 h-6 text-primary" /><div><h2 className="font-display text-xl font-bold">Compare this product</h2>{price && <p className="text-sm text-muted-foreground">TikTok price entered: {price}</p>}</div></div>
                  <p className="text-sm text-muted-foreground mt-3">Open matching searches and compare the exact size, quantity, shipping and seller. Prices are not yet imported automatically.</p>
                  <div className="grid sm:grid-cols-2 gap-2 mt-4">{comparisonLinks.map((link) => <Button key={link.name} variant="outline" asChild><a href={link.href} target="_blank" rel="noopener noreferrer">{link.name}<ExternalLink className="w-4 h-4 ml-2" /></a></Button>)}</div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
