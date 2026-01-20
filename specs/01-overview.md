# Project Overview

## Product Name
**Voqo** - AI Voice Agent Platform for Real Estate

## Purpose
Open-source AI phone answering agent platform for real estate professionals. Handles inbound calls, qualifies leads, answers property inquiries, and automates follow-ups.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14+ (App Router) |
| UI Components | Shadcn/ui |
| Styling | Tailwind CSS |
| Database | SQLite (single file: `voqo.db`) |
| ORM | Drizzle ORM |
| Voice AI | ElevenLabs Conversational AI |
| Telephony | Twilio (via ElevenLabs integration) |
| SMS | Twilio Programmable SMS |
| Language | TypeScript |

---

## Application Structure

### 1. Landing Page (Public)
Marketing website inspired by Square's design:
- Hero section with value proposition
- Feature highlights
- How it works
- Social proof / testimonials
- Pricing (placeholder)
- CTA to dashboard

### 2. Dashboard (App)
Main application for managing voice agents:
- Agents management
- Contacts & memories
- Call logs & history
- Campaigns & batch calling
- Settings & configuration

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Next.js App                          │
├─────────────────────────────────────────────────────────────┤
│  Landing Page          │  Dashboard App                     │
│  - / (home)            │  - /dashboard                      │
│  - /features           │  - /dashboard/agents               │
│  - /pricing            │  - /dashboard/contacts             │
│                        │  - /dashboard/calls                │
│                        │  - /dashboard/campaigns            │
│                        │  - /dashboard/settings             │
├─────────────────────────────────────────────────────────────┤
│                      API Routes                             │
│  - /api/agents         - /api/webhooks/elevenlabs           │
│  - /api/contacts       - /api/sms/send                      │
│  - /api/calls          - /api/outbound                      │
│  - /api/campaigns      - /api/functions                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      SQLite Database                        │
│  agents, contacts, memories, calls, campaigns, jobs, etc    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    External Services                        │
├─────────────────────────────────────────────────────────────┤
│  ElevenLabs Conversational AI                               │
│  - Agent hosting & voice synthesis                          │
│  - Real-time conversation handling                          │
│  - Post-call webhooks (transcripts, audio)                  │
├─────────────────────────────────────────────────────────────┤
│  Twilio                                                     │
│  - Phone number (hardcoded, imported to ElevenLabs)         │
│  - SMS sending for post-call automation                     │
└─────────────────────────────────────────────────────────────┘
```

---

## Core User Flows

### 1. Inbound Call Flow
```
Caller dials Twilio number
        │
        ▼
ElevenLabs receives call (native Twilio integration)
        │
        ▼
Agent converses with caller
  - Uses system prompt + contact memories
  - Can trigger custom functions (API calls)
        │
        ▼
Call ends → ElevenLabs sends webhook
        │
        ▼
Our app receives webhook
  - Stores call log (summary, transcript, duration)
  - Matches/creates contact
  - Updates memories
  - Sends post-call SMS to caller
```

### 2. Outbound Call Flow (Individual)
```
User selects contact in UI
        │
        ▼
Clicks "Call" → API request to ElevenLabs
        │
        ▼
ElevenLabs initiates outbound call via Twilio
        │
        ▼
Same conversation + post-call flow as inbound
```

### 3. Batch Outbound Flow
```
User creates campaign
        │
        ▼
Uploads CSV with phone numbers + variables
        │
        ▼
Creates batch job (selects agent, campaign)
        │
        ▼
Runs job → Sequential outbound calls
        │
        ▼
Each call logs independently
        │
        ▼
Job report generated (success/fail counts)
```

---

## Feature Summary

| Feature | Included | Notes |
|---------|----------|-------|
| Landing Page | Yes | Square-inspired marketing site |
| Multiple Agents | Yes | Different prompts, same voice |
| Voice Selection | No | Single hardcoded voice |
| Prompt Templates | Yes | Property Sales, Property Manager, Custom |
| Inbound Calls | Yes | Via ElevenLabs native Twilio |
| Outbound Calls | Yes | Individual + Batch |
| Call Logs | Yes | Summary, transcript, duration |
| Contacts | Yes | Name, phone, notes, tags |
| Memories | Yes | Per-contact, injected into prompts |
| Custom Functions | Yes | External API calls during conversation |
| Post-call SMS | Yes | To caller, template-based |
| Campaigns | Yes | Grouping for batch calls |
| Batch Uploads | Yes | CSV with phone + variables |
| Batch Jobs | Yes | Execute campaigns |
| Authentication | No | Single user, demo mode |
| Call Transfer | No | Not in MVP |
| Email Post-call | No | SMS only |
| Integrations | No | No REA/Domain/Calendar |
| Call Forwarding UI | No | Manual setup only |
| Number Management | No | Hardcoded number |

---

## Environment Variables

```env
# ElevenLabs
ELEVENLABS_API_KEY=
ELEVENLABS_AGENT_ID=
ELEVENLABS_WEBHOOK_SECRET=

# Twilio
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# App
DATABASE_URL=file:./voqo.db
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Directory Structure

```
voqo/
├── app/
│   ├── (marketing)/              # Landing page group
│   │   ├── page.tsx              # Home / Landing
│   │   ├── features/
│   │   │   └── page.tsx
│   │   ├── pricing/
│   │   │   └── page.tsx
│   │   └── layout.tsx            # Marketing layout
│   ├── (dashboard)/              # Dashboard group
│   │   ├── dashboard/
│   │   │   ├── page.tsx          # Dashboard home
│   │   │   ├── agents/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── new/
│   │   │   │       └── page.tsx
│   │   │   ├── contacts/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── calls/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── campaigns/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── jobs/
│   │   │   │       └── page.tsx
│   │   │   └── settings/
│   │   │       └── page.tsx
│   │   └── layout.tsx            # Dashboard layout (sidebar)
│   ├── api/
│   │   ├── agents/
│   │   │   └── route.ts
│   │   ├── contacts/
│   │   │   └── route.ts
│   │   ├── calls/
│   │   │   └── route.ts
│   │   ├── campaigns/
│   │   │   └── route.ts
│   │   ├── functions/
│   │   │   └── route.ts
│   │   ├── webhooks/
│   │   │   └── elevenlabs/
│   │   │       └── route.ts
│   │   ├── outbound/
│   │   │   └── route.ts
│   │   └── sms/
│   │       └── send/
│   │           └── route.ts
│   └── layout.tsx                # Root layout
├── components/
│   ├── ui/                       # Shadcn components
│   ├── marketing/                # Landing page components
│   │   ├── hero.tsx
│   │   ├── features.tsx
│   │   ├── how-it-works.tsx
│   │   ├── testimonials.tsx
│   │   ├── pricing.tsx
│   │   ├── cta.tsx
│   │   ├── navbar.tsx
│   │   └── footer.tsx
│   ├── dashboard/                # Dashboard components
│   │   ├── sidebar.tsx
│   │   ├── header.tsx
│   │   └── stats-card.tsx
│   ├── agents/
│   ├── contacts/
│   ├── calls/
│   └── campaigns/
├── lib/
│   ├── db/
│   │   ├── schema.ts
│   │   └── index.ts
│   ├── elevenlabs/
│   │   └── client.ts
│   ├── twilio/
│   │   └── client.ts
│   └── utils.ts
├── drizzle/
│   └── migrations/
├── public/
│   └── images/                   # Marketing images
├── voqo.db
├── drizzle.config.ts
├── next.config.js
├── tailwind.config.ts
├── package.json
└── tsconfig.json
```

---

## Development Setup

```bash
# Install dependencies
pnpm install

# Setup database
pnpm db:push

# Run development server
pnpm dev

# Build for production
pnpm build
```
