# Implementation Plan - Voqo

> This file is maintained by Ralph. It will be updated after each iteration.
> Run `./loop.sh plan` to regenerate if stale.

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Completed

---

## Phase 1: Foundation

### Project Setup
- [ ] Initialize Next.js 14+ project with App Router
- [ ] Install and configure Tailwind CSS
- [ ] Install and configure Shadcn/ui
- [ ] Setup Drizzle ORM with SQLite
- [ ] Create `.env.example` with all required variables:
  - [ ] ELEVENLABS_API_KEY
  - [ ] ELEVENLABS_AGENT_ID
  - [ ] ELEVENLABS_VOICE_ID
  - [ ] ELEVENLABS_PHONE_NUMBER_ID
  - [ ] TWILIO_ACCOUNT_SID
  - [ ] TWILIO_AUTH_TOKEN
  - [ ] TWILIO_PHONE_NUMBER
- [ ] Configure TypeScript strict mode
- [ ] Setup ESLint configuration

### Database Schema
- [ ] Create `lib/db/schema.ts` with all 11 tables:
  - [ ] agents
  - [ ] contacts
  - [ ] memories
  - [ ] calls
  - [ ] campaigns
  - [ ] uploads
  - [ ] batch_contacts
  - [ ] jobs
  - [ ] job_calls
  - [ ] custom_functions
  - [ ] settings
- [ ] Create `lib/db/index.ts` database client
- [ ] Run initial migration (`pnpm db:push`)
- [ ] Create database indexes:
  - [ ] calls.contact_id
  - [ ] calls.agent_id
  - [ ] calls.call_id (unique)
  - [ ] memories.contact_id
  - [ ] batch_contacts.upload_id
  - [ ] job_calls.job_id
  - [ ] custom_functions.agent_id

### Core Utilities
- [ ] Create `lib/utils.ts` with:
  - [ ] Phone number validation (E.164)
  - [ ] Phone number formatting
  - [ ] Duration formatting
  - [ ] Date formatting
  - [ ] cn() class merge utility

### API Clients
- [ ] Create `lib/elevenlabs/client.ts`:
  - [ ] Base request helper
  - [ ] Create/update/delete agent
  - [ ] Start outbound call
  - [ ] Get conversation
- [ ] Create `lib/twilio/client.ts`:
  - [ ] Send SMS function

---

## Phase 2: Core Features

### Dashboard Layout Components
- [ ] Sidebar component with navigation
- [ ] Page header component
- [ ] Stats card component
- [ ] Empty state component
- [ ] Status badge component
- [ ] Data table component with pagination
- [ ] Loading skeletons
- [ ] Toast notifications

### Agents (spec: 03-agents.md)
- [ ] API: `GET /api/agents` - list agents
- [ ] API: `POST /api/agents` - create agent + sync to ElevenLabs
- [ ] API: `GET /api/agents/[id]` - get agent
- [ ] API: `PATCH /api/agents/[id]` - update agent + sync
- [ ] API: `DELETE /api/agents/[id]` - delete agent + remove from ElevenLabs
- [ ] UI: Agents list page (`/dashboard/agents`)
- [ ] UI: Create agent page (`/dashboard/agents/new`)
- [ ] UI: Edit agent page (`/dashboard/agents/[id]`)
- [ ] Prompt templates (property_sales, property_manager, custom)

### Settings (spec: 07-post-call-sms.md)
- [ ] API: `GET /api/settings` - get all settings
- [ ] API: `PATCH /api/settings` - update settings
- [ ] UI: Settings page (`/dashboard/settings`)
- [ ] SMS settings section
- [ ] Contact settings section (auto-create, save memories)

### Telephony & Webhooks (spec: 04-telephony.md)
- [ ] API: `POST /api/webhooks/elevenlabs` - handle post-call webhook
- [ ] Webhook signature verification
- [ ] Handle `call_initiation_failure` webhook event
- [ ] API: `POST /api/outbound` - initiate outbound call
- [ ] Memory injection for outbound calls
- [ ] Contact matching on inbound calls
- [ ] Auto-create contact setting

### Call Logs (spec: 06-call-logs.md)
- [ ] API: `GET /api/calls` - list calls with filters
- [ ] API: `GET /api/calls/[id]` - get call detail
- [ ] API: `GET /api/calls/stats` - get call statistics
- [ ] UI: Call logs list page (`/dashboard/calls`)
- [ ] UI: Call detail page (`/dashboard/calls/[id]`)
- [ ] Transcript display component
- [ ] Recording player component

### Contacts & Memories (spec: 05-contacts-memories.md)
- [ ] API: `GET /api/contacts` - list with search/filter
- [ ] API: `POST /api/contacts` - create contact
- [ ] API: `GET /api/contacts/[id]` - get with memories
- [ ] API: `PATCH /api/contacts/[id]` - update contact
- [ ] API: `DELETE /api/contacts/[id]` - delete contact
- [ ] API: `POST /api/contacts/import` - CSV import
- [ ] API: `POST /api/contacts/[id]/memories` - add memory
- [ ] API: `DELETE /api/contacts/[id]/memories/[memoryId]` - delete memory
- [ ] Memory extraction from call transcripts
- [ ] Memory injection into agent prompts
- [ ] UI: Contacts list page (`/dashboard/contacts`)
- [ ] UI: Contact detail page (`/dashboard/contacts/[id]`)
- [ ] UI: CSV import modal
- [ ] UI: Add contact modal
- [ ] UI: Confirmation dialog component
- [ ] UI: Filter components (search, date range, status)

---

## Phase 3: Automation Features

### Post-Call SMS (spec: 07-post-call-sms.md)
- [ ] SMS sending function using Twilio
- [ ] Template variable substitution
- [ ] Integration with webhook handler
- [ ] Skip silent calls setting
- [ ] API: `POST /api/sms/send` - manual SMS send

### Custom Functions (spec: 08-custom-functions.md)
- [ ] API: `GET /api/agents/[agentId]/functions` - list functions
- [ ] API: `POST /api/agents/[agentId]/functions` - create function
- [ ] API: `GET /api/functions/[id]` - get function
- [ ] API: `PATCH /api/functions/[id]` - update function
- [ ] API: `DELETE /api/functions/[id]` - delete function
- [ ] API: `POST /api/functions/test` - test function
- [ ] API: `POST /api/functions/execute` - execute (called by ElevenLabs)
- [ ] Sync functions to ElevenLabs agent tools
- [ ] Auth type handling (none, api_key, bearer, basic)
- [ ] Credential encryption for custom functions
- [ ] Endpoint URL validation
- [ ] Response mapping
- [ ] UI: Functions tab on agent detail page
- [ ] UI: Function create/edit form

---

## Phase 4: Batch Operations

### Campaigns & Batch Outbound (spec: 09-batch-outbound.md)
- [ ] API: `GET /api/campaigns` - list campaigns
- [ ] API: `POST /api/campaigns` - create campaign
- [ ] API: `GET /api/campaigns/[id]` - get with uploads/jobs
- [ ] API: `PATCH /api/campaigns/[id]` - update campaign
- [ ] API: `DELETE /api/campaigns/[id]` - delete campaign
- [ ] API: `POST /api/campaigns/[id]/uploads` - upload CSV
- [ ] API: `GET /api/uploads/[id]` - get upload detail
- [ ] API: `DELETE /api/uploads/[id]` - delete upload
- [ ] API: `POST /api/campaigns/[id]/jobs` - create job
- [ ] API: `GET /api/jobs/[id]` - get job detail
- [ ] API: `POST /api/jobs/[id]/run` - start job
- [ ] API: `POST /api/jobs/[id]/cancel` - cancel job
- [ ] API: `GET /api/jobs/[id]/report` - download CSV report
- [ ] Job execution engine (sequential calls)
- [ ] Rate limiting for batch operations
- [ ] Variable injection into outbound calls
- [ ] UI: Campaigns list page (`/dashboard/campaigns`)
- [ ] UI: Campaign detail page (`/dashboard/campaigns/[id]`)
- [ ] UI: Job detail page
- [ ] UI: CSV upload modal
- [ ] UI: Job progress display

---

## Phase 5: UI Polish

### Dashboard Home (`/dashboard`)
- [ ] Stats cards (total calls, avg duration, inbound %, SMS sent)
- [ ] Recent calls list
- [ ] Quick actions

### Landing Page (spec: 11-landing-page.md)
- [ ] Marketing layout
- [ ] Navbar component
- [ ] Hero section (`/`)
- [ ] Features section
- [ ] How it works section
- [ ] Testimonials section
- [ ] Pricing section (demo mode)
- [ ] CTA section
- [ ] Footer component
- [ ] SEO metadata
- [ ] `/features` route
- [ ] `/pricing` route

---

## Bugs & Issues

_None yet. Bugs discovered during development will be logged here._

---

## Notes & Learnings

_Operational learnings will be recorded here._
