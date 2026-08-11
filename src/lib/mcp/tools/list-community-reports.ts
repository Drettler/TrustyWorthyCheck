import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { callPublicFunction } from "../env";

export default defineTool({
  name: "list_community_reports",
  title: "List community site reports",
  description:
    "List public community-submitted reports about suspicious or scam websites on TrustWorthyCheck.",
  inputSchema: {
    limit: z.number().int().describe("Maximum number of reports to return (1-50). Defaults to 20.").optional(),
    sort: z.enum(["recent", "most_reported"]).describe("Sort order. Defaults to recent.").optional(),
  },
  annotations: { readOnlyHint: true, openWorldHint: true },
  handler: async ({ limit, sort }) => {
    const capped = Math.min(Math.max(limit ?? 20, 1), 50);
    const data = (await callPublicFunction("public-reports", {
      query: { limit: String(capped), sort: sort ?? "recent" },
    })) as Record<string, any>;

    const reports = Array.isArray(data) ? data : (data?.reports ?? data?.data ?? []);
    if (!Array.isArray(reports)) {
      throw new ToolError("Unexpected response from the community reports service.");
    }
    const items = reports.slice(0, capped);
    return {
      content: [{ type: "text", text: JSON.stringify(items, null, 2) }],
      structuredContent: { reports: items },
    };
  },
});
