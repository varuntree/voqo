# Voqo - Operational Guide

## Quick Start

```bash
pnpm install          # Install dependencies
pnpm db:push          # Apply schema to SQLite
pnpm dev              # Start dev server at localhost:3000
```

## Validation Commands

Run after implementing to verify correctness:

```bash
pnpm tsc --noEmit     # TypeScript check
pnpm lint             # ESLint check
pnpm build            # Full production build
```

## Project Structure

```
voqo/
├── app/                    # Next.js App Router
│   ├── (marketing)/        # Landing page routes
│   ├── (dashboard)/        # Dashboard routes
│   └── api/                # API routes
├── components/
│   ├── ui/                 # Shadcn components
│   ├── marketing/          # Landing page components
│   └── dashboard/          # Dashboard components
├── lib/
│   ├── db/                 # Drizzle schema & client
│   ├── elevenlabs/         # ElevenLabs API client
│   └── twilio/             # Twilio API client
├── specs/                  # Feature specifications
└── voqo.db                 # SQLite database file
```

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **UI**: Shadcn/ui + Tailwind CSS
- **Database**: SQLite + Drizzle ORM
- **Voice AI**: ElevenLabs Conversational AI
- **Telephony/SMS**: Twilio

## Codebase Patterns

- Use Drizzle ORM for all database operations
- API routes: `app/api/[resource]/route.ts`
- Use Server Components by default, `'use client'` only when needed
- Phone numbers always in E.164 format (`+61412345678`)
- IDs use CUID2 via `@paralleldrive/cuid2`
- Forms use `react-hook-form` + `zod` for validation

## Database

- Single file: `voqo.db` in project root
- Schema defined in `lib/db/schema.ts`
- Run `pnpm db:push` after schema changes
- Run `pnpm db:studio` to browse data (Drizzle Studio)

## Environment Variables

Required in `.env.local`:

```
ELEVENLABS_API_KEY=
ELEVENLABS_VOICE_ID=
ELEVENLABS_WEBHOOK_SECRET=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
DATABASE_URL=file:./voqo.db
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## External API Notes

### ElevenLabs
- Base URL: `https://api.elevenlabs.io/v1`
- Create/update agents syncs to ElevenLabs
- Webhook endpoint: `/api/webhooks/elevenlabs`

### Twilio
- Phone number hardcoded in env
- Used for outbound caller ID and SMS sending
- Native integration with ElevenLabs for voice
