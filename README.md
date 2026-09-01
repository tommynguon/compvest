# OfferLens Canada

OfferLens Canada helps Canadian students and early-career professionals compare two job offers beyond headline salary. It separates cash compensation, estimated payroll deductions, location costs, benefits, and equity across one-year and four-year views.

## Stack

- React 19, TypeScript, and Vite
- Ruby 3.3 and Rails 8 JSON API
- SQLite for local development

## Local development

The repository pins its Ruby and Node versions in `.mise.toml`. If you already use [mise](https://mise.jdx.dev/), run:

```sh
mise install
cd backend && bundle install && bin/rails db:prepare
cd ../frontend && npm install
cd .. && bin/dev
```

During development, the frontend runs at `http://localhost:5173` and proxies API calls to Rails at `http://localhost:3000`.

This repository also includes a project-local Ruby bootstrap used during initial development. `bin/ruby` runs backend commands against that local toolchain when it is present.

## Product scope

- Account-based saved offers
- All Canadian provinces and territories
- Configurable salary, bonus, equity, benefits, commute, rent, and relocation inputs
- Estimated federal/provincial taxes and CPP/QPP, EI, and QPIP deductions
- One-year and four-year comparisons with transparent assumptions and manual overrides

OfferLens provides planning estimates, not financial or tax advice.
