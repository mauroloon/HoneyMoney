# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev        # Start Vite dev server at http://localhost:5173
pnpm build      # TypeScript compile + Vite bundle (output: dist/)
pnpm preview    # Serve production build locally
```

No test framework is configured. No linter/formatter is configured.

## Architecture

**honeyMoney** is a mobile-first PWA for shared couple finances. Stack: React 18 + TypeScript + Vite + Tailwind CSS + Supabase (auth, database, realtime).

### Context hierarchy (nested in this order)

```
AuthProvider → WalletProvider → FinanceProvider
```

- **AuthContext** (`src/contexts/AuthContext.tsx`) — Supabase Auth + `profiles` table. Provides `user`, `profile`, auth methods.
- **WalletContext** (`src/contexts/WalletContext.tsx`) — Wallet list and active wallet. Active wallet id persisted to `localStorage` as `hm_active_wallet`.
- **FinanceContext** (`src/contexts/FinanceContext.tsx`) — Transactions, categories, savings goals. Sets up a Supabase Realtime subscription scoped to the active wallet on `transactions` and `savings_goals` tables.

Pages that need finance data must be wrapped in all three providers. Pages at the auth/onboarding level only need `AuthProvider`.

### Routing (`src/App.tsx`)

| Path | Page | Notes |
|------|------|-------|
| `/` | Dashboard | Month selector, expense breakdown, recent transactions |
| `/transactions` | Transactions | Full history grouped by month |
| `/savings` | Savings goals | Goal CRUD and progress |
| `/wallet` | Wallet settings | Members, share code |
| `/auth` | Login / Register | Public route |
| `/no-wallet` | Onboarding | Shown when user has no wallet |

`Layout.tsx` wraps authenticated pages with a header and a four-tab bottom navigation bar.

### Supabase tables

`profiles`, `wallets`, `wallet_members`, `transactions`, `categories`, `savings_goals`

Client is initialized in `src/lib/supabase.ts` with the project URL and anon key.

Default categories (12 expense + 6 income) are inserted once when a wallet is first created, inside `FinanceContext`.

### Key utilities (`src/utils/`)

- **format.ts** — `formatCLP(amount)`, `formatDate(isoDate)`, `formatMonthYear(date)`, `groupByMonth(items)`, `generateShareCode()`, `greeting()`
- **icons.ts** — Maps SF Symbol names → emoji for cross-platform icon rendering; also exports preset goal icons and category icon options.

### UI conventions

- Mobile-first layout; max content width 430px.
- All UI text and date formatting is in **Spanish (es-CL)** with Chilean Peso (CLP).
- Tailwind custom theme: primary green `#00C57A`, income `#34C759`, expense `#FF3B30`, background `#F2F2F7`. Defined in `tailwind.config.js`.
- Bottom nav requires `pb-safe` padding for iOS home indicator.
- Share codes exclude visually ambiguous characters (`0 O I l S 5`).
