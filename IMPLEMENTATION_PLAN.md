# Implementation Plan - Voqo (PRIORITIZED)

> This file is maintained by Ralph. It will be updated after each iteration.
> Run `./loop.sh plan` to regenerate if stale.

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Completed

## Priority Legend
- **P0**: BLOCKING - Must complete before next phase
- **P1**: MVP Critical - Required for working demo
- **P2**: MVP Nice-to-have - Improves MVP but not blocking
- **P3**: Post-MVP - Can defer

---

## Phase 0: Project Scaffold [P0 - BLOCKING]

> **CRITICAL**: Nothing can proceed without this phase complete.
> **STATUS**: 100% complete

### 0.1 Initialize Project [P0]
- [x] Initialize Next.js 14+ with App Router (`pnpm create next-app voqo --typescript --tailwind --eslint --app --src-dir=false --import-alias "@/*"`)
- [x] Configure TypeScript strict mode in tsconfig.json
- [x] Create .gitignore (node_modules, .env.local, .next, voqo.db, *.db)

### 0.2 Core Dependencies [P0]
- [x] Install Shadcn/ui CLI and init (`pnpm dlx shadcn@latest init`)
- [x] Install Shadcn components (batch install):
  ```bash
  pnpm dlx shadcn@latest add button card input textarea select table dialog alert-dialog toast dropdown-menu badge switch tabs form skeleton separator avatar label alert
  ```
- [x] Install database deps: `pnpm add drizzle-orm better-sqlite3 && pnpm add -D drizzle-kit @types/better-sqlite3`
- [x] Install utility deps: `pnpm add @paralleldrive/cuid2 react-hook-form @hookform/resolvers zod`
- [x] Install icon library: `pnpm add lucide-react`
- [x] Install external service deps: `pnpm add twilio`
- [x] Install date/CSV utils: `pnpm add date-fns papaparse && pnpm add -D @types/papaparse`

### 0.3 Configuration Files [P0]
- [x] Create drizzle.config.ts pointing to voqo.db
- [x] Update next.config.js (serverExternalPackages: ['better-sqlite3'])
- [x] Add pnpm scripts to package.json: `db:push`, `db:studio`, `db:generate`
- [x] Create .env.local from .env.example with placeholder values
- [x] Verify .env.example has all variables:
  - ELEVENLABS_API_KEY, ELEVENLABS_VOICE_ID, ELEVENLABS_WEBHOOK_SECRET, ELEVENLABS_PHONE_NUMBER_ID
  - TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
  - DATABASE_URL, NEXT_PUBLIC_APP_URL

### 0.4 Theming & Globals [P0]
- [x] Configure globals.css with Square-inspired Shadcn theme (from spec 10)
- [x] Add Inter font via next/font in app/layout.tsx
- [x] Create basic app/layout.tsx with font and Toaster provider

### 0.5 Verification Checkpoint [P0]
- [x] `pnpm dev` starts without errors
- [x] `pnpm build` succeeds
- [x] Database connection works

### 0.6 Development Environment [P0]
- [x] Setup ngrok or expose localhost for webhook testing
- [x] Configure ElevenLabs webhook URL (temporary: ngrok URL + /api/webhooks/elevenlabs)
- [x] Verify .env.local has valid ElevenLabs/Twilio credentials
- [x] Test API connectivity to ElevenLabs and Twilio

---

## Phase 1: Database & Utilities [P0 - BLOCKING]

> **Depends on**: Phase 0 complete
> **Blocks**: Everything else
> **STATUS**: 100% complete

### 1.1 Database Schema [P0]
- [x] Create `lib/db/schema.ts` with ALL 11 tables:
  - agents (id, name, description, systemPrompt, template, greetingMessage, enabled, elevenlabsAgentId, timestamps)
  - contacts (id, name, phone UNIQUE, notes, tags JSON, timestamps)
  - memories (id, contactId FK, content, source enum, callId FK nullable, createdAt)
  - calls (id, agentId FK, contactId FK nullable, elevenlabsConversationId UNIQUE, direction, status, fromPhone, toPhone, summary, transcript JSON, duration, recordingUrl, recordingExpiresAt, smsSent, smsSentAt, startedAt, endedAt, createdAt)
  - campaigns (id, name, description, timestamps)
  - uploads (id, campaignId FK, filename, totalRows, createdAt)
  - batch_contacts (id, uploadId FK, phone, name, variables JSON, createdAt)
  - jobs (id, campaignId FK, uploadId FK, agentId FK, status enum, totalCalls, completedCalls, failedCalls, startedAt, finishedAt, createdAt)
  - job_calls (id, jobId FK, batchContactId FK, callId FK nullable, status enum, errorMessage, createdAt)
  - custom_functions (id, agentId FK, name, description, endpoint, method, headers JSON, authType, authConfig JSON, parameters JSON, responseMapping JSON, timeout, enabled, timestamps)
  - settings (id, key UNIQUE, value JSON, updatedAt)
- [x] Create `lib/db/index.ts` - database client singleton export
- [x] Run initial migration: `pnpm db:push`
- [x] Verify tables created with `pnpm db:studio`

### 1.2 Core Utilities [P0]
- [x] Create `lib/utils.ts` with:
  - `cn()` - tailwind-merge class utility
  - `isValidE164(phone)` - E.164 phone validation
  - `formatPhoneE164(phone, defaultCountry='AU')` - normalize phone numbers
  - `formatDuration(seconds)` - "Xm Ys" format
  - `formatDate(date)` - human-readable date
  - `formatTimestamp(seconds)` - transcript timestamp format

### 1.3 Type Definitions [P1]
- [x] Create `lib/types/index.ts` - shared TypeScript types (Agent, Contact, Call, etc.)
- [x] Create `lib/types/elevenlabs.ts` - ElevenLabs API response types
- [x] Create `lib/types/webhook.ts` - webhook payload types

---

## Phase 2: External API Clients [P1 - MVP Critical]

> **Depends on**: Phase 1 complete
> **Blocks**: Phase 4 (Agents), Phase 6 (Webhooks)
> **STATUS**: 0% complete - No API client code exists

### 2.1 ElevenLabs Client [P1]
- [ ] Create `lib/elevenlabs/client.ts`:
  - Private `request()` helper with Authorization header
  - `createAgent(config)` - POST /v1/convai/agents
  - `updateAgent(agentId, config)` - PATCH /v1/convai/agents/{id}
  - `deleteAgent(agentId)` - DELETE /v1/convai/agents/{id}
  - `startOutboundCall(config)` - POST /v1/convai/twilio/outbound-call
  - `getConversation(conversationId)` - GET /v1/convai/conversations/{id}
  - Export singleton instance
- [ ] Create `lib/elevenlabs/types.ts` - request/response type definitions

### 2.2 Twilio Client [P1]
- [ ] Create `lib/twilio/client.ts`:
  - Initialize Twilio client with env credentials
  - `sendSMS(to, body)` - send SMS via Twilio
  - Error handling wrapper

### 2.3 Settings Helper [P1]
- [ ] Create `lib/settings.ts`:
  - `getSetting(key)` - get single setting value
  - `getAllSettings()` - get all settings as object
  - `updateSetting(key, value)` - upsert setting
  - `initializeDefaultSettings()` - seed defaults on first access
  - Default settings: sms_enabled, sms_template, sms_skip_silent, auto_create_contacts, save_memories

---

## Phase 3: Dashboard Foundation [P1 - MVP Critical]

> **Depends on**: Phase 1 complete (can parallel with Phase 2)
> **Blocks**: All dashboard pages
> **STATUS**: 0% complete - No app/ or components/ directories exist

### 3.1 Layout Components [P1]
- [ ] Create `app/(dashboard)/layout.tsx` - wraps dashboard with sidebar
- [ ] Create `components/dashboard/sidebar.tsx`:
  - Logo at top
  - Navigation items: Dashboard, Agents, Contacts, Call Logs, Campaigns, Settings
  - Active state styling
  - "Single User Mode" footer
- [ ] Create `components/dashboard/page-header.tsx` - title + description + actions slot
- [ ] Create `components/dashboard/stats-card.tsx` - for dashboard home
- [ ] Create `components/dashboard/empty-state.tsx` - icon + title + description + action
- [ ] Create `components/dashboard/status-badge.tsx` - status-colored badges
- [ ] Create `components/dashboard/data-table.tsx` - reusable table with pagination
- [ ] Create `components/dashboard/loading-skeleton.tsx` - list/table skeletons
- [ ] Create `components/dashboard/confirm-dialog.tsx` - delete confirmation pattern

### 3.2 Dashboard Home [P2]
- [ ] Create `app/(dashboard)/dashboard/page.tsx`:
  - Stats cards row (can be placeholder initially)
  - Recent calls list (can be empty state initially)
  - Quick actions section

---

## Phase 4: Agents Feature [P1 - MVP Critical]

> **Depends on**: Phase 2 (ElevenLabs client), Phase 3 (layout)
> **Blocks**: Phase 6 (Webhooks need agents)

### 4.1 Prompt Templates [P1]
- [ ] Create `lib/prompts/templates.ts`:
  - `PROPERTY_SALES_TEMPLATE` - full prompt from spec 03
  - `PROPERTY_MANAGER_TEMPLATE` - full prompt from spec 03
  - `CUSTOM_TEMPLATE` - minimal template
  - `DEFAULT_GREETINGS` - per-template greetings
  - `substituteVariables(template, variables)` - replace {var} placeholders

### 4.2 Agents API [P1]
- [ ] Create `app/api/agents/route.ts`:
  - GET: list all agents with basic info
  - POST: create agent + sync to ElevenLabs, store elevenlabsAgentId
- [ ] Create `app/api/agents/[id]/route.ts`:
  - GET: single agent with full details
  - PATCH: update agent + sync to ElevenLabs
  - DELETE: delete agent + remove from ElevenLabs (preserve call history)

### 4.3 Agents UI [P1]
- [ ] Create `app/(dashboard)/dashboard/agents/page.tsx`:
  - Page header with "New Agent" button
  - Grid of agent cards OR empty state
- [ ] Create `components/agents/agent-card.tsx`:
  - Name, template badge, enabled toggle
  - Description preview
  - Edit/delete actions
- [ ] Create `app/(dashboard)/dashboard/agents/new/page.tsx`:
  - Back link
  - Agent form
- [ ] Create `components/agents/agent-form.tsx`:
  - Basic info: name, description
  - Template selection (radio cards)
  - System prompt textarea (auto-fills from template)
  - Variables reference sidebar
  - Greeting message input
  - Enabled toggle
  - Save/Cancel buttons
- [ ] Create `app/(dashboard)/dashboard/agents/[id]/page.tsx`:
  - Edit form (pre-filled)
  - Tabs: Overview, Custom Functions (placeholder), Call History (placeholder)

---

## Phase 5: Settings Feature [P1 - MVP Critical]

> **Depends on**: Phase 3 (layout), Phase 2 (settings helper)
> **Blocks**: Phase 6 (SMS requires settings)

### 5.1 Settings API [P1]
- [ ] Create `app/api/settings/route.ts`:
  - GET: return all settings (initialize defaults if empty)
  - PATCH: update one or more settings

### 5.2 Settings UI [P1]
- [ ] Create `app/(dashboard)/dashboard/settings/page.tsx`:
  - Page header
  - Settings sections as cards
- [ ] Create `components/settings/sms-settings.tsx`:
  - Enable SMS toggle
  - Skip silent calls toggle
  - Template textarea with variables reference
  - Preview section with character count
- [ ] Create `components/settings/contact-settings.tsx`:
  - Auto-create contacts toggle
  - Save memories toggle

---

## Phase 6: Webhooks & Telephony [P1 - MVP Critical]

> **THE CORE FUNCTIONALITY**
> **Depends on**: Phase 4 (agents), Phase 5 (settings), Phase 2 (clients)
> **Blocks**: All call-related features work

### 6.1 Webhook Handler [P1]
- [ ] Create `app/api/webhooks/elevenlabs/route.ts`:
  - Signature verification (HMAC-SHA256 from spec 04)
  - Route by event_type: post_call_transcription, call_initiation_failure
  - Return 200 immediately to prevent timeouts
- [ ] Implement `handleCallCompleted(payload)`:
  1. Determine caller phone from direction
  2. Find or create contact (if auto_create_contacts enabled)
  3. Map ElevenLabs agent_id to local agent
  4. Store call record with all fields
  5. Extract and save memories (if save_memories enabled)
  6. Send post-call SMS (if sms_enabled and has human speech)
  7. Update call record with SMS status
- [ ] Implement `handleCallFailed(payload)`:
  - Update pending call record to failed status
  - Store error message

### 6.2 Outbound Call API [P1]
- [ ] Create `app/api/outbound/route.ts`:
  - Validate phone number (E.164)
  - Get agent, verify elevenlabsAgentId exists
  - If contactId provided, fetch contact + memories
  - Build caller context string
  - Call ElevenLabs outbound call API
  - Create pending call record
  - Return conversationId and callId

### 6.3 Post-Call SMS [P1]
- [ ] Create `lib/sms/post-call.ts`:
  - `sendPostCallSMS({ call, contact, agent })`:
    - Check sms_enabled setting
    - Get template, substitute variables
    - Handle message length (truncate summary if > 1600 chars)
    - Send via Twilio
    - Update call record (smsSent, smsSentAt)
    - Error handling (log, don't throw)

### 6.4 Contact Matching [P1]
- [ ] Create `lib/contacts/matching.ts`:
  - `normalizePhone(phone)` - Convert to E.164 format
  - `findContactByPhone(phone)` - Exact match after normalization
  - `getOrCreateContact(phone, name, autoCreate)` - Based on settings
  - Handle auto_create_contacts setting

### 6.5 Memory Extraction [P2]
- [ ] Create `lib/memories/extract.ts`:
  - `extractMemoriesFromSummary(summary, existingMemories)`:
    - Parse call summary for facts
    - Simple heuristic extraction (MVP: use summary as single memory)
    - Or use LLM call if configured
  - `saveMemories(contactId, callId, memories)`:
    - Skip duplicates
    - Save with source='auto'

---

## Phase 7: Call Logs Feature [P1 - MVP Critical]

> **Depends on**: Phase 6 (webhooks create calls)

### 7.1 Calls API [P1]
- [ ] Create `app/api/calls/route.ts`:
  - GET with filters: agentId, contactId, direction, status, date range, search
  - Pagination support
  - Include agent and contact relations
- [ ] Create `app/api/calls/[id]/route.ts`:
  - GET: full call detail with transcript, agent, contact
- [ ] Create `app/api/calls/stats/route.ts` [P2]:
  - GET: totalCalls, avgDuration, inbound%, smsSent count
  - byDay array for charts

### 7.2 Calls UI [P1]
- [ ] Create `app/(dashboard)/dashboard/calls/page.tsx`:
  - Filters bar: date range, direction, agent, status, search
  - Data table with: direction icon, contact/phone, agent, duration, date, status, summary preview
  - Click row navigates to detail
- [ ] Create `components/calls/call-filters.tsx` - filter controls
- [ ] Create `app/(dashboard)/dashboard/calls/[id]/page.tsx`:
  - Back link
  - Call overview card
  - Summary section
  - Recording player (with expiry handling)
  - Transcript view (chat-style)
  - SMS status section
- [ ] Create `components/calls/transcript-view.tsx` - chat-style transcript
- [ ] Create `components/calls/recording-player.tsx` - audio player with expiry warning

---

## Phase 8: Contacts & Memories [P2 - MVP Nice-to-have]

> **Depends on**: Phase 7 (contacts need call matching)

### 8.1 Contacts API [P1]
- [ ] Create `app/api/contacts/route.ts`:
  - GET: list with search, tags filter, pagination
  - POST: create contact (validate unique phone)
- [ ] Create `app/api/contacts/[id]/route.ts`:
  - GET: contact with memories and recent calls
  - PATCH: update contact
  - DELETE: delete contact (cascade memories)
- [ ] Create `app/api/contacts/import/route.ts` [P2]:
  - POST: CSV import with validation
- [ ] Create `app/api/contacts/[id]/memories/route.ts`:
  - POST: add manual memory
- [ ] Create `app/api/contacts/[id]/memories/[memoryId]/route.ts`:
  - DELETE: delete memory

### 8.2 Contacts UI [P1]
- [ ] Create `app/(dashboard)/dashboard/contacts/page.tsx`:
  - Search bar, tag filter
  - Data table: name, phone, tags, last contact date
  - Add Contact button, Import CSV button [P2]
- [ ] Create `components/contacts/add-contact-modal.tsx`
- [ ] Create `components/contacts/csv-import-modal.tsx` [P2]
- [ ] Create `app/(dashboard)/dashboard/contacts/[id]/page.tsx`:
  - Contact info card (editable)
  - Memories section with add/delete
  - Call history section

### 8.3 CSV Parsing [P2]
- [ ] Create `lib/csv/parser.ts`:
  - `parseContactsCSV(text)` using papaparse
  - Phone validation per row
  - Variables extraction

---

## Phase 9: Custom Functions [P3 - Post-MVP]

> **Depends on**: Phase 4 (agents)

### 9.1 Functions API [P3]
- [ ] Create `app/api/agents/[agentId]/functions/route.ts`
- [ ] Create `app/api/functions/[id]/route.ts`
- [ ] Create `app/api/functions/test/route.ts`
- [ ] Create `app/api/functions/execute/route.ts` - called by ElevenLabs

### 9.2 Function Execution [P3]
- [ ] Create `lib/functions/execute.ts`:
  - `buildRequest()`, `buildHeaders()`, `mapResponse()`
  - Timeout handling, error responses

### 9.3 Functions UI [P3]
- [ ] Add "Custom Functions" tab to agent detail page
- [ ] Create `components/functions/function-list.tsx`
- [ ] Create `components/functions/function-form.tsx`

### 9.4 Credential Security [P3]
- [ ] Create `lib/encryption.ts` - encrypt/decrypt auth_config

---

## Phase 10: Batch Campaigns [P3 - Post-MVP]

> **Depends on**: Phase 4 (agents), Phase 8 (contacts)

### 10.1 Campaigns API [P3]
- [ ] Create `app/api/campaigns/route.ts`
- [ ] Create `app/api/campaigns/[id]/route.ts`
- [ ] Create `app/api/campaigns/[id]/uploads/route.ts`
- [ ] Create `app/api/uploads/[id]/route.ts`
- [ ] Create `app/api/campaigns/[id]/jobs/route.ts`
- [ ] Create `app/api/jobs/[id]/route.ts`
- [ ] Create `app/api/jobs/[id]/run/route.ts`
- [ ] Create `app/api/jobs/[id]/cancel/route.ts`
- [ ] Create `app/api/jobs/[id]/report/route.ts`

### 10.2 Job Execution Engine [P3]
- [ ] Create `lib/jobs/executor.ts`:
  - `runJob()` with sequential processing
  - 5-second rate limiting
  - Cancellation checking
  - Progress updates

### 10.3 Campaigns UI [P3]
- [ ] Create campaign list, detail, job pages
- [ ] Create upload and job modals
- [ ] Create progress bar and calls table components

---

## Phase 11: Landing Page [P2 - Can Parallel]

> **CAN START ANYTIME after Phase 0**

### 11.1 Marketing Layout [P2]
- [ ] Create `app/(marketing)/layout.tsx`
- [ ] Create `components/marketing/navbar.tsx`
- [ ] Create `components/marketing/footer.tsx`

### 11.2 Landing Page Sections [P2]
- [ ] Create `app/(marketing)/page.tsx` - compose sections
- [ ] Create `components/marketing/hero.tsx`
- [ ] Create `components/marketing/features.tsx`
- [ ] Create `components/marketing/how-it-works.tsx`
- [ ] Create `components/marketing/testimonials.tsx` [P3]
- [ ] Create `components/marketing/pricing.tsx`
- [ ] Create `components/marketing/cta.tsx`

### 11.3 SEO & Assets [P2]
- [ ] Add placeholder images to public/images/
- [ ] Configure SEO metadata in marketing layout
- [ ] Add Open Graph image

---

## Phase 12: Polish & Validation [P2]

> **Final phase**

### 12.1 Error Handling [P2]
- [ ] Create `components/error-boundary.tsx`
- [ ] Add `error.tsx` for each route group
- [ ] Implement toast notifications for all actions

### 12.2 Loading States [P2]
- [ ] Add `loading.tsx` for each major route
- [ ] Implement skeleton loaders for all lists

### 12.3 Final Validation [P1]
- [ ] `pnpm tsc --noEmit` - zero errors
- [ ] `pnpm lint` - zero warnings
- [ ] `pnpm build` - successful
- [ ] Manual smoke test all MVP features

---

## MVP Milestone Checkpoint

After completing P0 and P1 tasks from Phases 0-7, verify:

- [ ] Can create an agent and it syncs to ElevenLabs
- [ ] Can receive webhook from ElevenLabs after a call
- [ ] Call record is stored with transcript/summary
- [ ] Contact is auto-created (if enabled)
- [ ] Post-call SMS is sent (if enabled)
- [ ] Can view call logs in dashboard
- [ ] Can initiate outbound call via API
- [ ] Settings can be configured

## CURRENT PROJECT STATUS (2026-01-20)

**Overall Progress: 30% - PHASE 1 COMPLETE**

### Analysis Summary:
- ✅ **Specifications**: Complete (11 detailed spec files)
- ✅ **Implementation Plan**: Comprehensive 558-line roadmap
- ✅ **Environment**: .env.example ready
- ✅ **Phase 0**: Project scaffold, dependencies, configuration complete
- ✅ **Phase 1**: Database schema with all 11 tables, core utilities, type definitions complete
- ❌ **API Clients**: ElevenLabs and Twilio clients not created

### Immediate Next Steps:
1. **Phase 2 starting** - External API clients implementation required
2. **ElevenLabs integration** - Build client for agent management and outbound calls
3. **Twilio integration** - Build client for SMS functionality
4. **Settings helper** - Create settings management utilities

### Critical Path to First Demo:
```
✅ Phase 0 (Scaffold) → ✅ Phase 1 (Database) → Phase 2 (API Clients) → Phase 6 (Webhooks)
Estimated: ~20 remaining tasks to minimal webhook receiving capability
```

---

## Dependency Graph (Visual)

```
Phase 0 (Scaffold) ═════════════════════════════════════════╗
    ║                                                       ║
    ║ BLOCKS EVERYTHING                                     ║
    ↓                                                       ║
Phase 1 (Database + Utils) ═════════════════════════════════╣
    ║                                                       ║
    ╠════════════════════╦══════════════════════════════════╝
    ↓                    ↓
Phase 2 (API Clients)    Phase 3 (Dashboard Layout)
    ║                         ║
    ╠═════════════════════════╣
    ↓                         ↓
Phase 4 (Agents) ────────→ Phase 5 (Settings)
    ║                              ║
    ╠══════════════════════════════╣
    ↓
Phase 6 (Webhooks + Telephony) ← MVP CORE
    ║
    ↓
Phase 7 (Call Logs) ← MVP Required
    ║
    ↓
Phase 8 (Contacts) ← MVP Nice-to-have
    ║
    ╠════════════════════════════════════╗
    ↓                                    ↓
Phase 9 (Custom Functions)    Phase 10 (Batch Campaigns)
    ║                              ║
    ╠══════════════════════════════╣
    ↓
Phase 12 (Polish)

Phase 11 (Landing Page) ← CAN PARALLEL anytime after Phase 0
```

---

## Bugs & Issues

_None yet. Bugs discovered during development will be logged here._

---

## Notes & Learnings

_Operational learnings will be recorded here._

---

## Unresolved Questions

### ✅ Resolved (MVP Decisions Made):
1. **Memory Extraction LLM**: Use call summary directly for MVP, defer LLM extraction to post-MVP
2. **Agent-ElevenLabs Mapping**: Store elevenlabsAgentId in agents table, map on webhook receipt via API lookup
3. **Credential Encryption**: Use simple base64 for MVP, proper encryption post-MVP
4. **Job Concurrency**: Single job at a time for MVP (sequential)
5. **Recording Storage**: Accept 7-day expiry for MVP, warn users in UI
6. **Rate Limiting**: 5-second delay between batch calls, ElevenLabs limits TBD
7. **Error Recovery**: Log webhook failures, no retry queue for MVP

### ❓ Still Need Clarification:
1. **ElevenLabs Phone Number**: Is Twilio number already imported to ElevenLabs? Need phone_number_id?
2. **Voice Configuration**: Which ElevenLabs voice ID to use? (ELEVENLABS_VOICE_ID in env)
3. **Webhook Agent Matching**: How to map incoming agent_id to local agent record reliably?
4. **Development Testing**: Local webhook testing strategy - ngrok required?
5. **Environment Setup**: Step-by-step ElevenLabs + Twilio integration guide needed?

---

## Quick Start Commands

```bash
# Phase 0 - Initialize
pnpm create next-app voqo --typescript --tailwind --eslint --app --src-dir=false --import-alias "@/*"
cd voqo
pnpm dlx shadcn@latest init
pnpm dlx shadcn@latest add button card input textarea select table dialog alert-dialog toast dropdown-menu badge switch tabs form skeleton separator avatar label alert
pnpm add drizzle-orm better-sqlite3 @paralleldrive/cuid2 react-hook-form @hookform/resolvers zod lucide-react twilio date-fns papaparse
pnpm add -D drizzle-kit @types/better-sqlite3 @types/papaparse

# Database commands
pnpm db:push    # Apply schema changes
pnpm db:studio  # Open Drizzle Studio

# Development
pnpm dev        # Start dev server
pnpm build      # Production build
pnpm lint       # Run linter
```
