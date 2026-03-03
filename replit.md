# Hablock Web

A Next.js 16 property management platform ("The Modern Building OS") that connects verified building residents, enables property managers to post alerts, and provides a public marketplace for vacant unit listings.

## Tech Stack

- **Framework**: Next.js 16 (App Router, React 19, TypeScript)
- **Styling**: Tailwind CSS v4
- **Database**: PostgreSQL via Prisma ORM (Replit-managed)
- **Auth**: JWT-based with HTTP-only cookies (`hablock_access` + `hablock_refresh`)
- **Storage**: Local filesystem (`public/uploads/`) for profile photos; S3 module available for future use
- **Animation**: Framer Motion
- **Encryption**: AES-256-CBC for chat messages (via `crypto` in `auth.ts`)
- **Date Utils**: date-fns

## Project Structure

```
src/
  app/
    page.tsx              - Marketing / landing page
    layout.tsx            - Root layout
    api/upload/           - Local file upload API endpoint
    app/
      layout.tsx          - App shell with sidebar + mobile nav + toast container
      feed/
        page.tsx          - Server component: auth + initial encrypted posts
        FeedClient.tsx    - Client component: chat UI with polling + optimistic updates
        actions.ts        - Server actions: submitChatMessage, syncCommunityState
      alerts/page.tsx     - Building alerts with 48h expiration
      residents/page.tsx  - Residents directory
    listings/             - Public marketplace (dynamic rendering)
    login/                - Login page
    register/             - Registration page
    manager/              - Manager dashboard (role-protected)
  lib/
    auth.ts               - JWT helpers + AES-256-CBC encrypt/decrypt utilities
    prisma.ts             - Prisma client singleton
    storage.ts            - S3 storage helpers (unused, kept for future)
  middleware.ts           - Route protection + role-based access
prisma/
  schema.prisma           - Database schema (PostgreSQL)
  seed.ts                 - Database seed script (countries, areas, admin user)
```

## Key Features

- **Encrypted Chat Feed**: AES-256-CBC encrypted messages stored in DB, decrypted on read. Real-time polling every 5s with slide-in toast notifications for new messages/alerts/users.
- **48h Rolling Expiration**: Both chat messages and alerts auto-filter to last 48 hours. Persistent "Say hi!" posts preserved.
- **Residents Directory**: Profile photos, roles, names, unit mappings scoped to authenticated community.
- **Mobile Nav**: Bottom bar with Feed, Alerts, Residents. Desktop sidebar with full navigation.

## Key Data Models

- **User** - residents / managers / admins linked to buildings and units
- **Building** - multi-unit residential properties
- **Unit** - individual units within a building
- **Post** - community chat messages (AES encrypted content)
- **Alert** - manager-issued alerts (emergency / maintenance / reminder)
- **Listing** + **ListingImage** - public marketplace listings
- **Inquiry** - user inquiries on listings
- **LocationCountry / LocationArea** - geographic taxonomy

## Development

```bash
npm run dev        # Starts Next.js on 0.0.0.0:5000
npm run db:generate  # Regenerate Prisma client
npm run db:push      # Push schema to database
npm run db:seed      # Seed the database with countries and admin
```

## Build & Deploy

The build command runs `prisma generate && prisma db push --skip-generate && next build`.
All database-querying pages use `export const dynamic = 'force-dynamic'` to prevent pre-rendering failures at build time.
Production runs `next start` on port 5000.

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string (managed by Replit)
- `JWT_SECRET` - Secret for signing access tokens (falls back to a hardcoded value in dev)
- `REFRESH_SECRET` - Secret for signing refresh tokens
- `ENCRYPTION_KEY` - 32-byte key for AES-256-CBC chat encryption (falls back to hardcoded dev key)
- AWS/S3 credentials optional (only if S3 storage is enabled later)

## Workflow

- **Start application**: `npm run dev` → port 5000 (webview)
