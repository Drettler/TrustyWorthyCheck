import { defineMcp } from "@lovable.dev/mcp-js";
import checkWebsiteTool from "./tools/check-website";
import listThreatFeedTool from "./tools/list-threat-feed";
import listCommunityReportsTool from "./tools/list-community-reports";

export default defineMcp({
  name: "trustworthy",
  title: "TrustWorthy",
  version: "0.1.0",
  instructions:
    "Tools from TrustWorthyCheck, a website legitimacy and scam checker. Use `check_website` to score a URL or domain for trustworthiness (domain age, TLS, reputation, business transparency, scam reports). Use `list_threat_feed` for recent scam threats and `list_community_reports` for community-submitted suspicious sites. All data is public; no user account is required.",
  tools: [checkWebsiteTool, listThreatFeedTool, listCommunityReportsTool],
});
