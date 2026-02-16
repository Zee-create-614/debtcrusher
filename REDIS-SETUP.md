# DebtCrusher Redis Setup

## What Changed
All `/tmp` file-based storage replaced with **Upstash Redis** for persistent data on Vercel serverless.

### Files Modified
- `app/lib/redis.ts` — **NEW** shared Redis client
- `app/api/user/analyses/route.ts` — Redis instead of `/tmp/debtcrusher-users.json`
- `app/api/user/credit-repair-results/route.ts` — Redis instead of `/tmp/{hash}.json`
- `app/api/user/payments/route.ts` — Redis-based payment storage (replaces Square API list-all approach)
- `app/api/checkout/route.ts` — Added `userEmail` + `note` to Square payment link for tracking
- `app/api/credit-repair/log/route.ts` — Updated to await async database calls
- `lib/database.ts` — Redis instead of `/tmp/credit_repair_logs.json` (all methods now async)

### Redis Key Patterns
| Key | Value |
|-----|-------|
| `user:analyses:{email}` | JSON array of analysis objects |
| `user:credit-results:{email}` | JSON object with results + unlock status |
| `user:payments:{email}` | JSON array of payment records |
| `credit_repair_logs` | JSON array of all credit repair dispute logs |

## Setup Steps

### 1. Create Upstash Account
1. Go to [console.upstash.com](https://console.upstash.com)
2. Create a free Redis database
3. Copy the **REST URL** and **REST Token**

### 2. Add Environment Variables to Vercel
In Vercel project settings → Environment Variables, add:
```
UPSTASH_REDIS_REST_URL=https://YOUR-DB.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXxx...
```

### 3. For Local Development
Copy `.env.local.example` to `.env.local` and fill in the values.

### 4. Deploy
Push to git / redeploy on Vercel. No other changes needed.

## Notes
- Upstash free tier: 10,000 commands/day, 256MB storage — more than enough
- Data now persists across Vercel function invocations and cold starts
- The sessionStorage checkout flow issue is fixed because results are saved to Redis before redirect
- Payment records are now stored per-user in Redis when checkout succeeds (the frontend should POST to `/api/user/payments` after successful checkout)
