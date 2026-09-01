# OfferLens Canada

OfferLens Canada helps Canadian students and early-career professionals compare two job offers beyond headline salary. It separates cash compensation, estimated payroll deductions, location costs, benefits, and equity across one-year and four-year views.

## Stack

- React 19, TypeScript, and Vite
- Ruby 3.3 and Rails 8 JSON API
- SQLite for local development
- TanStack Query, React Hook Form, Zod, Recharts, and Rails service objects

## Local development

The repository pins its Ruby and Node versions in `.mise.toml`. If you already use [mise](https://mise.jdx.dev/), run:

```sh
mise install
cd backend && bundle install && bin/rails db:prepare
cd ../frontend && npm install
cd .. && bin/dev
```

During development, the frontend runs at `http://127.0.0.1:5173` and proxies API calls to Rails at `http://127.0.0.1:3000`.

This repository also includes a project-local Ruby bootstrap used during initial development. `bin/ruby` runs backend commands against that local toolchain when it is present.

### Demo workspace

Load the two-offer demo and sign in with the seeded credentials:

```sh
cd backend
../bin/ruby bin/rails db:seed
```

- Email: `demo@offerlens.ca`
- Password: `DemoOffer2026!`

## Product scope

- Account-based saved offers
- All Canadian provinces and territories
- Configurable salary, bonus, equity, benefits, commute, rent, and relocation inputs
- Estimated federal/provincial taxes and CPP/QPP, EI, and QPIP deductions
- One-year and four-year comparisons with transparent assumptions and manual overrides

## API

The Rails JSON API is versioned under `/api/v1`:

- `POST /register`, `/login`, and `DELETE /logout`
- `GET /me`
- CRUD `/offers`
- `POST /comparisons` with exactly two user-owned offer IDs
- `GET /reference/jurisdictions`

Authentication uses an HTTP-only signed session cookie. Money is stored as integer cents, and every offer is scoped to its owner.

## Tax methodology

The comparison engine uses the `2026-H2` dataset, progressive federal and provincial/territorial brackets, basic credits, CPP/QPP, second CPP/QPP, EI, QPIP, the Quebec federal abatement, and Ontario surtax/health premium. It calculates each vesting year independently and lets users override annual deductions when they have a more precise payroll estimate.

The source URLs are returned with every comparison. OfferLens provides planning estimates, not financial or tax advice.

## Verification

Run the backend tests, RuboCop, frontend Vitest suite, lint, and production build together:

```sh
bin/check
```

Playwright covers the unauthenticated welcome flow separately:

```sh
cd frontend
npx playwright install chromium
npm run test:e2e
```

## Container deployment

The Rails and nginx/Vite images can run together behind one origin. Generate and provide a production secret before starting:

```sh
export SECRET_KEY_BASE="$(openssl rand -hex 64)"
docker compose up --build
```

The containerized app is served at `http://localhost:8080`, with persistent SQLite data stored in the `backend_storage` volume. For a public deployment, provide the secret through the hosting platform rather than committing it.
