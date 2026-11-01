# Fix: Threat Feed not updating

## What's wrong
The newest threat entry is from May 20, 2026. The automatic updates (every 6 hours and the daily recheck) still run, but the backend rejects each one as "Unauthorized." The update functions need a secret key, and the schedule never sends it. So nothing new has been added since then.

## Fix
1. Make sure the scheduler's secret key exists (create one if it's missing).
2. Change both scheduled jobs (refresh every 6 hours, recheck daily) so they read that secret from secure storage and send it with each call. The secret won't sit in plain text in the schedule.
3. Leave the update functions locked to the scheduler. Visitors' browsers still can't start scraping.
4. Run the refresh once by hand to fill the feed right away. Then confirm new entries appear on the Threat Feed page.
5. Show "Last updated" on the Threat Feed page, so it's clear how fresh the data is.

## Technical details
- `fetch-threat-feeds` and `recheck-threat-sources` check the `x-cron-secret` header against `CRON_SECRET`. The cron commands in `supabase/config.toml` only send `Content-Type`.
- Store `CRON_SECRET` in Vault. Update both cron commands to add the header `x-cron-secret` from `vault.decrypted_secrets`.
- Check the result in the edge function logs and with `select max(created_at) from threat_feeds`.
