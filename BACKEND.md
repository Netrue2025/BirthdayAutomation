# BirthdayFlow Backend

Fastify + Prisma backend for the BirthdayFlow V1 MVP.

## Local Setup

1. Copy `.env.example` to `.env`.
2. Start PostgreSQL:

```bash
docker compose up postgres -d
```

3. Generate Prisma client and run migrations:

```bash
npm run prisma:generate
npm run prisma:migrate
```

4. Start the API:

```bash
npm run dev:api
```

Production-style build:

```bash
npm run build:api
npm run start:api
```

## Core Endpoints

- `GET /health`
- `GET /api/dashboard`
- `GET /api/members?page=1&limit=20&search=&birthday=all|today|upcoming`
- `POST /api/members`
- `GET /api/members/:id`
- `PATCH /api/members/:id`
- `DELETE /api/members/:id`
- `GET /api/templates`
- `GET /api/settings`
- `PATCH /api/settings`
- `POST /api/birthdays/scan?mode=today|upcoming&days=7`
- `POST /api/cards/generate`
- `GET /api/whatsapp/link?phoneNumber=...&message=...`
- `POST /api/uploads/profile-image`

## Reminder Flow

The cron engine runs two timezone-aware jobs:

- Daily birthday scan: creates/updates birthday events, generates card images, sends Telegram notifications.
- Upcoming birthday scan: prepares reminder events and sends Telegram reminder messages.

Telegram is skipped safely when `telegramEnabled` is false or bot credentials are missing. Every attempt is written to `NotificationLog`.

## Image Flow

Birthday cards are rendered with Sharp from SVG template composition, then cached in `GeneratedCard`. Files are saved under `uploads/cards` and served from `/uploads/cards/...`.

For Supabase Storage uploads, configure:

```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_STORAGE_BUCKET=uploads
```

The `uploads` bucket should be public if the frontend needs to display returned image URLs directly. Without `SUPABASE_SERVICE_ROLE_KEY`, the API will reject uploads instead of returning broken Supabase URLs.

## WhatsApp Flow

The backend only generates compliant `wa.me` links and prefilled text. It does not attempt unsupported WhatsApp automation.

## Deployment

The repo includes:

- `Dockerfile`
- `docker-compose.yml`
- `.dockerignore`
- Prisma migration files
- `.env.example`

For Render/Railway/VPS, set `DATABASE_URL`, run `npm run prisma:deploy`, then start `npm run start:api`.
