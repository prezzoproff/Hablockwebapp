# Hablock Web

A Next.js 16 property management platform ("The Modern Building OS") that connects verified building residents, enables property managers to post alerts, and provides a public marketplace for vacant unit listings.

## Tech Stack

- **Framework**: Next.js 16 (App Router, React 19, TypeScript)
- **Styling**: Tailwind CSS v4
- **Database**: SQLite via Prisma ORM (dev.db stored at `prisma/dev.db`)
- **Auth**: JWT-based with HTTP-only cookies (`hablock_access` + `hablock_refresh`)
- **Storage**: Local filesystem (`public/uploads/`) for profile photos; S3 module available for future use
- **Animation**: Framer Motion

## Project Structure

```
src/
  app/
    page.tsx          - Marketing / landing page
    layout.tsx        - Root layout
    app/              - Authenticated resident area (feed)
    listings/         - Public marketplace
    login/            - Login page
    register/         - Registration page
    manager/          - Manager dashboard (role-protected)
  lib/
    auth.ts           - JWT helpers (generate/verify tokens, set cookies)
    prisma.ts         - Prisma client singleton
    storage.ts        - S3 storage helpers (unused, kept for future)
    api/upload/route.ts - Local file upload API endpoint
  middleware.ts       - Route protection + role-based access
prisma/
  schema.prisma       - Database schema
  dev.db              - SQLite development database
  seed.ts             - Database seed script
```

## Key Data Models

- **User** - residents / managers / admins linked to buildings and units
- **Building** - multi-unit residential properties
- **Unit** - individual units within a building
- **Post** - community bulletin board posts
- **Alert** - manager-issued alerts (emergency / maintenance / reminder)
- **Listing** + **ListingImage** - public marketplace listings
- **Inquiry** - user inquiries on listings
- **LocationCountry / LocationArea** - geographic taxonomy

## Development

The dev script sets `DATABASE_URL=file:./prisma/dev.db` explicitly, overriding the runtime-managed Postgres URL, since this project uses SQLite.

```bash
npm run dev       # Starts Next.js on 0.0.0.0:5000
npm run db:generate  # Regenerate Prisma client
npm run db:migrate   # Apply migrations to dev.db
npm run db:seed      # Seed the database
```

## Environment Variables

- `JWT_SECRET` - Secret for signing access tokens (falls back to a hardcoded value in dev)
- `REFRESH_SECRET` - Secret for signing refresh tokens
- `DATABASE_URL` is overridden in the dev script to point to SQLite
- AWS/S3 credentials optional (only if S3 storage is enabled later)

## Workflow

- **Start application**: `npm run dev` → port 5000 (webview)
