# LinqWorks web app

OMS + WMS frontend for LinqWorks (see `../CommerceOS_Complete_Development_Plan.md`).
React 19 · TypeScript · Vite · React Router · TanStack Query · Zustand · React Hook Form + Zod, on the Alloce Material theme (same foundation as bird-crm).

## Run

```bash
npm install
cp .env.example .env   # mocks on, demo account enabled
npm run dev            # http://localhost:5173
```

Sign in with **Try the demo account** (`demo@linqworks.app` / `Demo@12345`). It works without a backend: auth falls back to a local offline session and every product module uses the in-browser demo API.

| Command | |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Type-check + production build |
| `npm run lint` | Oxlint |

## Backend vs demo data

Each product module calls `VITE_API_BASE_URL` (`/api/v1/...`, paths from plan §6) or the mock, per `VITE_USE_MOCKS`:
`true`, `false`, or a list such as `inventory,warehouse` to keep only those mocked while the rest go live.
Modules: `commerce, inventory, warehouse, procurement, shipping, threepl, integrations, platform`.
Responses use the NestJS envelope `{ success, statusCode, message, data }`; lists return `{ data, current_page, last_page, from, to, total }`.

The mock (`src/api/mock`) is per-workspace, persisted in localStorage, and enforces the same rules the API must: order state machine, reservations, the stock ledger as the only way stock changes, approval steps, idempotent booking. Reset it by clearing site data.

## Structure

```text
src/
├── api/
│   ├── endpoints/   one file per module (commerce, inventory, warehouse, procurement, shipping, threepl, integrations, platform) + foundation (auth, tenants, access)
│   ├── mock/        seed.ts (demo data), db.ts (collections), ops.ts (stock moves + ledger)
│   └── resource.ts  createResourceApi + mock/live switch per module
├── components/
│   ├── common/      ResourceList (list pages), EntityFormModal (schema-driven forms), DataTable, PageHeader, Panel, Guard…
│   ├── features/    shared/LineItemsEditor, scan/ScanInput, shell, workspace, account…
│   └── ui/          StatusBadge, Drawer, Dropdown, Tabs, Controls…
├── constants/       routes, permissions (plan §3.2), domain options + order state machine, status tones
├── hooks/queries/   useList / useOne / useAction, reference data (warehouses, suppliers…)
├── layouts/         Auth, Master (app shell), Scan (warehouse scanner)
├── pages/           dashboard, reports, orders, customers, catalog, inventory, warehouse, procurement, shipping, threepl, integrations, automation, scan, settings, admin
└── types/           one file per domain
```

## Screens

Public landing + regional pricing (`/welcome`) · Dashboard (launch checklist, quick actions) · Global sales and Shipping performance dashboards · Reports · Orders (status rail, detail, manual create, bulk actions) · Customers · Products · Catalog imports · Sales channels ·
App marketplace (plug-and-play install wizard for ~50 marketplace, store, courier, payment, accounting and messaging apps across UAE, KSA, USA, UK, Australia) · Marketplace listings (publish, reprice, resubmit) · Storefronts (per-market, Arabic RTL preview) · Couriers + rate shopper ·
Stock overview, ledger, reservations, adjustments, transfers, stock counts, lots, replenishment ·
Warehouses, locations, receipts, putaway, pick waves, tasks, packing, dispatch, staff ·
Purchase orders, suppliers, requisitions, supplier returns ·
Shipments, tracking exceptions, carriers, COD reconciliation, returns ·
3PL clients, rate cards, usage ledger, statements, SLA ·
Connectors, LinqWorks Direct API, webhooks, sync jobs, failed events, automation rules (visual flow preview), 16 automation templates, execution history ·
Settings: workspace, tax/currency/operations, users, roles, API keys, subscription, invoice & airway-bill template designer, audit log, system health ·
Documents (`/print/documents`): tax invoices (UAE/KSA bilingual, VAT/GST) and airway bills (4×6, A6, 100×100, A4) with Code 128 barcodes, single or bulk print ·
Scanner app (`/scan`): my tasks, guided pick/putaway with short-pick, receiving, bin-to-bin moves (keyboard-wedge scanners, camera fallback, no offline stock changes).
