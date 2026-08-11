import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { callPublicFunction } from "../env";

function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  let parsed: URL;
  try {
    parsed = new URL(withScheme);
  } catch {
    throw new ToolError(`"${input}" is not a valid website URL or domain.`);
  }
  if (!parsed.hostname.includes(".")) {
    throw new ToolError(`"${input}" is not a valid website URL or domain.`);
  }
  return parsed.toString();
}

export default defineTool({
  name: "check_website",
  title: "Check website trustworthiness",
  description:
    "Run a full legitimacy check on a website URL or domain and return its trust score (0-100), verdict (safe / caution / danger), summary, red flags and positive signals. Analysis can take up to a minute for domains that have not been checked recently.",
  inputSchema: {
    url: z.string().describe("Website URL or bare domain to analyze, e.g. example.com"),
  },
  annotations: { readOnlyHint: true, openWorldHint: true },
  handler: async ({ url }) => {
    const target = normalizeUrl(url);
    const result = (await callPublicFunction("analyze-url", {
      method: "POST",
      body: { url: target },
    })) as Record<string, any>;

    if (result?.success === false) {
      throw new ToolError(String(result.message ?? "Could not analyze this website."));
    }

    const analysis = (result?.data ?? result) as Record<string, any>;
    const summary = {
      url: target,
      trustScore: analysis?.trustScore ?? null,
      verdict: analysis?.verdict ?? null,
      summary: analysis?.summary ?? null,
      confidence: analysis?.confidence?.level ?? null,
      redFlags: analysis?.details?.redFlags ?? [],
      positiveSignals: analysis?.details?.positiveSignals ?? [],
      domain: analysis?.details?.domain ?? null,
    };

    return {
      content: [{ type: "text", text: JSON.stringify(summary, null, 2) }],
      structuredContent: summary,
    };
  },
});
