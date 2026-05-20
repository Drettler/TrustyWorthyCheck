// Popular domains for programmatic SEO pages at /check/:domain
// Targets long-tail searches like "is shein.com safe", "is temu legit"
export const POPULAR_DOMAINS: string[] = [
  // Mega retailers / marketplaces
  "amazon.com", "ebay.com", "walmart.com", "target.com", "costco.com",
  "etsy.com", "aliexpress.com", "alibaba.com", "wish.com", "temu.com",
  "shein.com", "fashionnova.com", "romwe.com", "zaful.com", "lightinthebox.com",
  "dhgate.com", "newegg.com", "bestbuy.com", "homedepot.com", "lowes.com",
  "wayfair.com", "overstock.com", "macys.com", "nordstrom.com", "kohls.com",
  // Fashion / apparel
  "nike.com", "adidas.com", "lululemon.com", "zara.com", "hm.com",
  "uniqlo.com", "gap.com", "oldnavy.com", "asos.com", "boohoo.com",
  "prettylittlething.com", "revolve.com", "farfetch.com", "ssense.com",
  // Tech & electronics
  "apple.com", "samsung.com", "microsoft.com", "dell.com", "hp.com",
  "lenovo.com", "asus.com", "razer.com", "logitech.com", "anker.com",
  // Streaming / digital
  "netflix.com", "hulu.com", "disneyplus.com", "spotify.com", "youtube.com",
  "twitch.tv", "primevideo.com", "hbo.com", "paramountplus.com",
  // Travel & hospitality
  "booking.com", "expedia.com", "airbnb.com", "tripadvisor.com", "kayak.com",
  "hotels.com", "priceline.com", "vrbo.com", "agoda.com", "trivago.com",
  // Food delivery
  "doordash.com", "ubereats.com", "grubhub.com", "instacart.com", "postmates.com",
  // Crypto & finance
  "coinbase.com", "binance.com", "kraken.com", "robinhood.com", "paypal.com",
  "venmo.com", "cashapp.com", "zellepay.com", "wise.com", "revolut.com",
  // Social / dating
  "facebook.com", "instagram.com", "tiktok.com", "snapchat.com", "twitter.com",
  "linkedin.com", "reddit.com", "pinterest.com", "tinder.com", "bumble.com",
  "hinge.co", "match.com", "okcupid.com",
  // Misc popular scam-checked sites
  "groupon.com", "stockx.com", "goat.com", "depop.com", "vinted.com",
  "mercari.com", "poshmark.com", "thredup.com", "carvana.com", "vroom.com",
  "carmax.com", "cargurus.com", "edmunds.com", "kbb.com", "autotrader.com",
  // Gaming
  "steampowered.com", "epicgames.com", "roblox.com", "minecraft.net",
  "playstation.com", "xbox.com", "nintendo.com", "ea.com", "ubisoft.com",
  // Education / productivity
  "coursera.org", "udemy.com", "khanacademy.org", "duolingo.com",
  "chatgpt.com", "openai.com", "anthropic.com", "perplexity.ai",
  // Government / utility (commonly impersonated)
  "irs.gov", "usps.com", "fedex.com", "ups.com", "dhl.com",
];

export function isPopularDomain(domain: string): boolean {
  return POPULAR_DOMAINS.includes(domain.toLowerCase());
}
