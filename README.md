# CompVest

CompVest is a local-first financial comparison tool for Canadian and U.S. internships and full-time offers. It opens directly to your saved offers, keeps inputs in their native CAD or USD currency, estimates deductions, and compares expected savings after the living costs you enter.

CompVest is designed for one person on a local computer. It has no accounts, sign-in flow, onboarding, or shared-user features. Do not expose it as a public multi-user service without adding authentication and authorization.

## Stack

- React 19, TypeScript, and Vite
- Ruby 3.3 and Rails 8 JSON API
- SQLite for local offer storage
- TanStack Query, React Hook Form, Zod, Recharts, Vitest, and Playwright
- Rails service objects, Minitest, RuboCop, and Brakeman

## Local development

The repository pins Ruby and Node versions in `.mise.toml`. With [mise](https://mise.jdx.dev/) installed:

```sh
mise install
cd backend && bundle install && bin/rails db:prepare
cd ../frontend && npm install
cd .. && bin/dev
```

The frontend runs at `http://127.0.0.1:5173` and proxies API calls to Rails at `http://127.0.0.1:3000`. A project-local Ruby bootstrap is also available through `bin/ruby` when present.

To load two sample cross-border internships:

```sh
cd backend
../bin/ruby bin/rails db:seed
```

## What it compares

- Canada (CAD) and the United States (USD), with province/territory or state/DC work locations
- Full-time annual or hourly pay with one-year periods and four-year totals
- Internships with hourly or annualized pay, hours per week, and exact term length
- Salary, bonuses, equity, benefits, rent, other living costs, commute, and relocation
- Total internship savings and savings per week, including unequal term lengths
- Editable CAD/USD display currency and offline exchange rate saved in browser storage
- Manual income-tax and payroll-deduction overrides

The initial offline rate is `1 USD = 1.3888 CAD`, dated 2026-08-28 from the Bank of Canada. Offer inputs remain in native currency; results are rounded to cents with `BigDecimal` before comparison.

## API

The Rails JSON API is under `/api/v1`:

- CRUD `/offers`
- `POST /comparisons` with exactly two offer IDs, `display_currency`, and `usd_to_cad_rate`
- `GET /reference/jurisdictions` for country, currency, and region metadata

There are no account or session endpoints. Money is stored as integer cents in the local SQLite database.

## Tax methodology

Canadian estimates cover 2026 federal and provincial/territorial income tax, CPP/QPP, EI, QPIP, the Quebec federal abatement, and Ontario surtax and health premium rules.

U.S. estimates cover 2026 federal income tax, Social Security, Medicare, and automatic planning estimates for all 50 states plus DC. The model assumes a single filer, standard/basic deductions, no dependents, taxation based on work location, and internship income earned in one calendar year.

Municipal taxes, visas, tax treaties, foreign-tax credits, health-plan premiums, and unusual residency rules are excluded. CompVest is a planning aid, not financial or tax advice; calculation sources and limitations are shown with every comparison.

## Verification

Run backend tests, RuboCop, Brakeman, Zeitwerk, frontend Vitest, lint, and the production build:

```sh
bin/check
```

Run browser coverage separately:

```sh
cd frontend
npx playwright install chromium
npm run test:e2e
```

## Local container

The Rails and nginx/Vite images can run together behind one local origin:

```sh
export SECRET_KEY_BASE="$(openssl rand -hex 64)"
docker compose up --build
```

The tool is served at `http://localhost:8080`, with SQLite data in the `backend_storage` volume. This container configuration is intended for private local use.
