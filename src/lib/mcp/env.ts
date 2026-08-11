type RuntimeGlobals = typeof globalThis & {
  Deno?: { env?: { get?: (name: string) => string | undefined } };
  process?: { env?: Record<string, string | undefined> };
};

function runtimeEnv(name: string): string | undefined {
  const runtime = globalThis as RuntimeGlobals;
  return runtime.Deno?.env?.get?.(name) ?? runtime.process?.env?.[name];
}

function configuredEnv(names: readonly string[]): string | undefined {
  for (const name of names) {
    const value = runtimeEnv(name)?.trim();
    if (value) return value;
  }
  return undefined;
}

export function supabaseProjectUrl(): string {
  const url = configuredEnv(["SUPABASE_URL", "VITE_SUPABASE_URL"]);
  if (!url) throw new Error("SUPABASE_URL (or VITE_SUPABASE_URL) is required");
  return url.replace(/\/+$/, "");
}

export function supabasePublishableKey(): string {
  const direct = configuredEnv([
    "SUPABASE_PUBLISHABLE_KEY",
    "VITE_SUPABASE_PUBLISHABLE_KEY",
  ]);
  if (direct) return direct;

  const keyset = runtimeEnv("SUPABASE_PUBLISHABLE_KEYS");
  if (keyset) {
    try {
      const parsed: unknown = JSON.parse(keyset);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        const keys = parsed as Record<string, unknown>;
        const key = [keys.default, ...Object.values(keys)]
          .find((v): v is string => typeof v === "string" && v.trim().startsWith("sb_publishable_"))
          ?.trim();
        if (key) return key;
      }
    } catch {
      // fall through to legacy names
    }
  }

  const legacy = configuredEnv(["SUPABASE_ANON_KEY", "VITE_SUPABASE_ANON_KEY"]);
  if (legacy) return legacy;
  throw new Error("SUPABASE_PUBLISHABLE_KEY, SUPABASE_PUBLISHABLE_KEYS, or SUPABASE_ANON_KEY is required");
}

/** Calls one of this app's public edge functions (anon access only). */
export async function callPublicFunction(
  name: string,
  init: { method?: "GET" | "POST"; body?: unknown; query?: Record<string, string> } = {},
): Promise<unknown> {
  const key = supabasePublishableKey();
  const url = new URL(`${supabaseProjectUrl()}/functions/v1/${name}`);
  for (const [k, v] of Object.entries(init.query ?? {})) url.searchParams.set(k, v);

  const res = await fetch(url.toString(), {
    method: init.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });

  const text = await res.text();
  let parsed: unknown = text;
  try {
    parsed = JSON.parse(text);
  } catch {
    // keep raw text
  }
  if (!res.ok) {
    const message =
      (parsed && typeof parsed === "object" && "message" in parsed
        ? String((parsed as Record<string, unknown>).message)
        : undefined) ?? `Request failed with status ${res.status}`;
    throw new Error(message);
  }
  return parsed;
}
