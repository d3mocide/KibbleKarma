# 🐾 KibbleKarma

A cozy, personal pet wellness log that tracks meals, weight, and basic health
events so your pets stay happy and healthy. Think "CreditKarma for our furry
friends with paws" — a friendly, non-clinical wellness companion.

- **Manage multiple pets** (dogs, cats, and others).
- **Define foods** and **log meals** with automatic calorie computation based on
  energy density.
- **Track weight** and **health events** over time, with charts and trends.
- **Barcode lookup** that auto-populates food details from
  [Open Food Facts](https://world.openfoodfacts.org).
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
├── docker-compose.yml
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

## Local development (without Docker)

You need Node 20+ and a PostgreSQL 16 instance.

```bash
make setup           # copy env files, install deps, generate Prisma client
make db-migrate      # create tables (uses backend/.env DATABASE_URL)
make dev-backend     # http://localhost:4000   (run in one terminal)
make dev-frontend    # http://localhost:5173   (run in another; proxies /api)
```

`make db-seed` optionally loads demo data. See `make help` for the rest
(`db-reset`, `db-studio`, `build`, `typecheck`, `logs`, …).

## Configuration

All configuration is via environment variables. See
[`.env.example`](./.env.example) (root, for Docker) and
[`backend/.env.example`](./backend/.env.example).

| Variable          | Description                                  | Default                          |
| ----------------- | -------------------------------------------- | -------------------------------- |
| `DATABASE_URL`    | PostgreSQL connection string                 | —                                |
| `JWT_SECRET`      | Secret for signing auth tokens               | —                                |
| `JWT_EXPIRES_IN`  | Token lifetime                               | `7d`                             |
| `CORS_ORIGIN`     | Allowed origins (`*` or comma-separated)     | `*`                              |
| `ALLOW_OPEN_REGISTRATION` | Allow signups after the first owner  | `false`                          |
| `OFF_BASE_URL`    | Open Food Facts base URL                     | `https://world.openfoodfacts.org`|
| `OFF_USER_AGENT`  | User-Agent sent to Open Food Facts           | `KibbleKarma/1.0 ...`            |
| `OFF_TIMEOUT_MS`  | Timeout for OFF requests                      | `8000`                           |

## API overview

All endpoints are prefixed with `/api`. Protected routes require an
`Authorization: Bearer <token>` header.

| Method | Path                                   | Description                          |
| ------ | -------------------------------------- | ------------------------------------ |
| GET    | `/auth/status`                         | First-run/registration state (public) |
| POST   | `/auth/register` · `/auth/login`       | Enroll owner / get a JWT             |
| GET    | `/auth/me`                             | Current user                        |
| GET/POST | `/pets`                              | List / create pets                  |
| GET/PUT/DELETE | `/pets/:id`                    | Pet detail / update / delete        |
| GET/POST | `/foods`                             | List / create foods                 |
| POST   | `/foods/lookup-by-barcode`             | Barcode → Open Food Facts lookup    |
| GET/PUT/DELETE | `/foods/:id`                   | Food detail (OFF foods read-only)   |
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
  logs. Open Food Facts foods are shared and read-only.
- **Open Food Facts:** if a product has no energy data the food is still
  created with empty energy fields so it can be edited manually. Remote
  failures and "not found" barcodes return explicit, friendly errors.
- **Multi-user ready:** the data model is keyed by user, so although v1 is
  designed for a single user, multiple accounts work out of the box.
