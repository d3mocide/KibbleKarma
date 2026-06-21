# 🐾 KibbleKarma

A cozy, personal pet wellness log that tracks meals, weight, and basic health
events so your pets stay happy and healthy. Think "CreditKarma for our furry
friends with paws" — a friendly, non-clinical wellness companion.

- **Manage multiple pets** (dogs, cats, and others).
- **Define foods** and **log meals** with automatic calorie computation based on
  energy density.
- **Track weight** and **health events** over time, with charts and trends.
- **Barcode lookup** that auto-populates food details from
  [Open Pet Food Facts](https://world.openpetfoodfacts.org).
- **Self-hosted friendly** — runs as a set of Docker containers.

## Tech stack

| Layer    | Choice                                                       |
| -------- | ----------------------------------------------------------- |
| Backend  | TypeScript · Express · Prisma · PostgreSQL · JWT auth · Zod |
| Frontend | React (Vite) · TypeScript · TailwindCSS · Recharts          |
| Scanning | `@zxing/browser` (optional browser-camera barcode reader)   |
| Infra    | Docker Compose (db · backend · frontend)                    |

## Project structure

```
.
├── backend/                  # Express + Prisma API
│   ├── prisma/
│   │   ├── schema.prisma     # DB schema
│   │   ├── migrations/       # SQL migrations
│   │   └── seed.ts           # Demo seed data
│   └── src/
│       ├── routes/           # auth, pets, foods, meals, weights, events, ...
│       ├── services/         # Open Food Facts client, summaries/trends
│       ├── middleware/       # auth + error handling
│       ├── utils/            # calorie math, serialization, access checks
│       └── index.ts          # entrypoint
├── frontend/                 # Vite + React app
│   └── src/
│       ├── api/              # typed API client
│       ├── components/       # UI, charts, forms, scanner
│       ├── pages/            # login, pets, dashboard, foods
│       └── context/          # auth context
├── docker-compose.yml       # production stack
├── docker-compose.dev.yml   # dev overlay (hot reload)
└── .env.example
```

> A [`Makefile`](./Makefile) wraps every common task. Run **`make help`** to
> see the full, self-documenting list.

## Quick start (Docker — recommended)

```bash
make up        # builds images and starts db + backend + frontend
```

(or `cp .env.example .env && docker compose up --build` if you prefer.)

Then open **http://localhost**.

### First launch → owner enrollment

On first launch the database is empty, so KibbleKarma greets you with a
**"Welcome — create your owner account"** setup screen. The first account you
create becomes the owner of the instance. There is no hardcoded admin user.

After the owner exists, public registration is closed by default (set
`ALLOW_OPEN_REGISTRATION=true` to allow more accounts). The backend runs
migrations automatically on startup.

> **Optional demo data:** `make seed` loads a sample pet, foods, and logs.
> The demo login is **demo@kibblekarma.app** / **password123** — handy for a
> tour, but not required (and not created unless you seed).

## Local development (Docker, hot reload)

The dev stack runs the same containers as production, but the backend
watch-compiles with `tsx` and the frontend is served by the Vite dev server —
both with your source bind-mounted, so edits reload live.

```bash
make dev        # API http://localhost:4000 · web http://localhost:5173
```

This layers [`docker-compose.dev.yml`](./docker-compose.dev.yml) over the base
file (`docker compose -f docker-compose.yml -f docker-compose.dev.yml up`). The
backend applies migrations on startup; create new ones with `make db-migrate`
and load demo data with `make db-seed` — both run inside the running container.
See `make help` for the rest (`dev-bg`, `db-reset`, `db-studio`, `typecheck`, …).

> `make setup` (env file + local `npm install` + Prisma client) is only needed
> for host-side `make typecheck` / `make build`; it isn't required to run the app.

## Configuration

All configuration is via environment variables in a single
[`.env.example`](./.env.example) at the repo root (Compose assembles
`DATABASE_URL` from the `POSTGRES_*` values, so it isn't listed separately).

| Variable          | Description                                  | Default                          |
| ----------------- | -------------------------------------------- | -------------------------------- |
| `DATABASE_URL`    | PostgreSQL connection string                 | —                                |
| `JWT_SECRET`      | Secret for signing auth tokens               | —                                |
| `JWT_EXPIRES_IN`  | Token lifetime                               | `7d`                             |
| `CORS_ORIGIN`     | Allowed origins (`*` or comma-separated)     | `*`                              |
| `ALLOW_OPEN_REGISTRATION` | Allow signups after the first owner  | `false`                          |
| `OFF_BASE_URL`    | Open Pet Food Facts base URL                 | `https://world.openpetfoodfacts.org`|
| `OFF_USER_AGENT`  | User-Agent sent to Open Pet Food Facts       | `KibbleKarma/1.0 ...`            |
| `OFF_TIMEOUT_MS`  | Timeout for OFF requests                      | `8000`                           |

## API overview

All endpoints are prefixed with `/api`. Protected routes require an
`Authorization: Bearer <token>` header.

| Method | Path                                   | Description                          |
| ------ | -------------------------------------- | ------------------------------------ |
| GET    | `/auth/status`                         | First-run/registration state (public) |
| POST   | `/auth/register` · `/auth/login`       | Enroll owner / get a JWT             |
| GET/PATCH | `/auth/me`                          | Current user / update preferences (units) |
| GET/POST | `/pets`                              | List / create pets                  |
| GET/PUT/DELETE | `/pets/:id`                    | Pet detail / update / delete        |
| GET/POST | `/foods`                             | List / create foods                 |
| POST   | `/foods/lookup-by-barcode`             | Barcode → Open Pet Food Facts lookup |
| GET/PUT/DELETE | `/foods/:id`                   | Food detail / edit / delete (per-user; OFF foods can't be edited) |
| GET/POST | `/pets/:petId/foods`                 | Pet diet (food profiles)            |
| PUT/DELETE | `/pet-food-profiles/:id`           | Update / remove a diet entry        |
| GET/POST | `/pets/:petId/meals`                 | List / log meals                    |
| PUT/DELETE | `/meals/:id`                       | Update / delete a meal              |
| GET    | `/pets/:petId/daily-summary?date=`     | Daily kcal/grams summary            |
| GET/POST | `/pets/:petId/weights`               | Weight series (+30d trend) / log    |
| PUT/DELETE | `/weights/:id`                     | Update / delete a weigh-in          |
| GET/POST | `/pets/:petId/events`                | Health events                       |
| PUT/DELETE | `/events/:id`                      | Update / delete an event            |
| GET    | `/pets/:petId/export/{meals,weights}.csv` | CSV export                       |

### Calorie computation

When a meal is logged the backend computes `computedKcal` using the first
available rule:

1. `grams` + `energy_kcal_per_kg` → `(grams / 1000) × kcal_per_kg`
2. `servings` + `energy_kcal_per_serving` → `servings × kcal_per_serving`
3. `grams` + `energy_kcal_per_100g` → `(grams / 100) × kcal_per_100g`

## Notes

- **Authorization:** users only ever see and modify their own pets, foods, and
  logs. Each account has its own private food catalog — including entries
  created from barcode/Open Food Facts lookups (the OFF data itself is still
  read-only and can't be edited, only added or removed from your own list).
- **Open Food Facts:** if a product has no energy data the food is still
  created with empty energy fields so it can be edited manually. Remote
  failures and "not found" barcodes return explicit, friendly errors.
- **Multi-user:** the data model is fully per-user — every pet, food, and log
  is scoped to its owner, and accounts are isolated from one another. The first
  account is the owner; additional users can sign up once you set
  `ALLOW_OPEN_REGISTRATION=true` (otherwise public registration stays closed
  after the owner is enrolled).
- **Units:** all data is stored in metric (kg / grams / kcal). Each user picks
  metric or imperial display under **Settings** (new accounts default to
  imperial); the frontend converts weights and food amounts for display and
  back to metric on save. Energy is always in kcal.
