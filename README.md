# Nexvora Digital Solutions

A responsive agency website built with Next.js, an Express API and Supabase. The portfolio contains clearly labelled concept work so it does not imply these are completed client engagements.

## Project layout

- `frontend/` — Next.js App Router website and admin inquiry interface.
- `backend/` — Express API for public inquiries and authenticated admin inquiry management.
- `supabase/migrations/` — PostgreSQL schema, triggers and Row Level Security policies.

## Requirements

- Node.js 20.9 or newer
- A Supabase project

## Configure Supabase

1. Apply `supabase/migrations/20261030000000_initial_schema.sql` to your Supabase project.
2. In Supabase Auth, create an administrator user. Public sign-up is not part of this starter.
3. Promote that user by running this SQL with the user's Auth UUID:

   ```sql
   insert into public.profiles (id, display_name, role)
   values ('AUTH_USER_UUID', 'Nexvora Admin', 'admin');
   ```

4. Copy `backend/.env.example` to `backend/.env` and set the project URL and **service-role** key. The service-role key is server-only and must never be added to the frontend or committed.
5. Copy `frontend/.env.example` to `frontend/.env.local`, set the public Supabase URL and anon key, and set the API URL if it differs from `http://localhost:4000`.

The public Supabase anon key is designed for browser use and is restricted by RLS. Admin data access is checked by the API against both the Supabase Auth user and the `profiles.role` value.

## Run locally

Install the frontend and API dependencies from the project root:

```powershell
npm install --prefix frontend
npm install --prefix backend
```

In one terminal, start the frontend from the project root:

```powershell
npm run dev
```

In a second terminal, start the API:

```powershell
npm run dev:api
```

Open `http://localhost:3000`. The API health check is at `http://localhost:4000/health`. Contact form submissions are validated and rate-limited by the API before being stored in Supabase.

## Production notes

- Set `CORS_ORIGINS` to the exact public frontend origin(s), separated by commas.
- Set `NEXT_PUBLIC_SITE_URL` to the canonical website URL for metadata.
- Deploy the frontend and API independently, and configure the frontend's `NEXT_PUBLIC_API_URL`.
- Keep `SUPABASE_SERVICE_ROLE_KEY` only in the API deployment's secret environment.
- Create admin accounts through Supabase Auth and explicitly add their profile rows. Do not expose public account creation for the admin area.
- The inquiry dashboard currently supports secure sign-in, listing recent requests and updating inquiry status. Other admin modules (services, portfolio, testimonials, blog and settings) have database foundations but are not yet exposed as dashboard CRUD screens.

## Validation

```powershell
npm run lint
npm run build
```

```powershell
npm run typecheck:api
```
