import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { callPublicFunction } from "../env";

export default defineTool({
  name: "list_threat_feed",
  title: "List recent scam threats",
  description:
    "List recent scam and fraud threats from TrustWorthyCheck's public threat feed (aggregated from public security and consumer-protection sources).",
  inputSchema: {
    limit: z.number().int().describe("Maximum number of threats to return (1-50). Defaults to 20.").optional(),
  },
  annotations: { readOnlyHint: true, openWorldHint: true },
  handler: async ({ limit }) => {
    const capped = Math.min(Math.max(limit ?? 20, 1), 50);
    const data = (await callPublicFunction("public-threats", {
      query: { limit: String(capped) },
    })) as Record<string, any>;

    const threats = Array.isArray(data) ? data : (data?.threats ?? data?.data ?? []);
    if (!Array.isArray(threats)) {
      throw new ToolError("Unexpected response from the threat feed.");
    }
    const items = threats.slice(0, capped);
    return {
      content: [{ type: "text", text: JSON.stringify(items, null, 2) }],
      structuredContent: { threats: items },
    };
  },
});
