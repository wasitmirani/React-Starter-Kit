# React Kit

A production-oriented React + TypeScript starter built with Vite. It ships a layered folder structure for API, features, state, routing, and shared UI so you can start building features instead of wiring the project from scratch.

## Stack

| Layer | Library |
| --- | --- |
| UI | React 19 |
| Build | Vite 8 + TypeScript |
| Routing | React Router 7 |
| Server state | TanStack Query |
| Client state | Zustand |
| HTTP | Axios |
| Validation | Zod |
| Lint | Oxlint |

## Getting started

```bash
npm install
cp .env.example .env
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run Oxlint |

### Environment

Copy `.env.example` to `.env` and adjust as needed:

```env
VITE_APP_NAME=React Kit
VITE_API_BASE_URL=http://localhost:3000/api
```

Values are read through `src/config/env.config.ts`.

## Project structure

```text
src/
├── api/                 # HTTP client, interceptors, endpoint modules
├── assets/              # Fonts, icons, images, global CSS
├── components/
│   ├── common/          # Shared primitives (Button, Input, Modal, …)
│   ├── features/        # Feature-specific UI (auth, dashboard, products)
│   └── ui/              # Presentational UI (Card, Badge, Toast, …)
├── config/              # App, env, routes, and theme config
├── constants/           # API paths, routes, messages, regex
├── contexts/            # Auth, theme, and notification providers
├── hooks/               # Reusable React hooks
├── layouts/             # Main, auth, and dashboard shells
├── lib/                 # Axios, React Query, router, validation
├── pages/               # Route-level screens
├── services/            # Domain services over API endpoints
├── store/               # Zustand stores (auth, user, ui)
├── types/               # Shared TypeScript types
├── utils/               # Formatters, helpers, validators
├── App.tsx
└── main.tsx
```

Path alias `@/` maps to `src/`.

## Architecture notes

- **API layer** — `api/http-client.ts` and `api/interceptors.ts` wrap Axios. Endpoint files under `api/endpoints/` stay thin; `services/` owns domain calls.
- **State** — Zustand for global UI/auth/user state (`useAuthStore`, `useUserStore`, `useUiStore`); TanStack Query for server data.
- **Routing** — Route constants live in `constants/routes.constants.ts`; the router is assembled in `lib/router.config.tsx`.
- **Providers** — `App.tsx` wires React Query, Auth, Theme, Notification, and an error boundary around the router.
- **Components** — Prefer co-located folders (`Component.tsx`, `Component.types.ts`, `Component.styles.ts`, `index.ts`).

## Routes

| Path | Page |
| --- | --- |
| `/` | Redirects to dashboard |
| `/login`, `/register`, `/forgot-password` | Auth |
| `/dashboard`, `/analytics`, `/settings` | Dashboard |
| `/products`, `/products/:id`, `/products/new` | Products |
| `*` | 404 |

## License

Private / internal starter kit.
