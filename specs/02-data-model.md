# Data Model Specification

## Database
- **Engine**: SQLite
- **File**: `voqo.db` in project root
- **ORM**: Drizzle ORM

---

## Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   agents    │       │  contacts   │       │  memories   │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id (PK)     │       │ id (PK)     │◄──────│ contact_id  │
│ name        │       │ name        │       │ id (PK)     │
│ description │       │ phone       │       │ content     │
│ system_prompt│      │ notes       │       │ created_at  │
│ template    │       │ tags        │       └─────────────┘
│ enabled     │       │ created_at  │
│ created_at  │       │ updated_at  │
│ updated_at  │       └─────────────┘
└─────────────┘              │
      │                      │
      │                      │
      ▼                      ▼
┌─────────────────────────────────────┐
│               calls                 │
├─────────────────────────────────────┤
│ id (PK)                             │
│ agent_id (FK)                       │
│ contact_id (FK, nullable)           │
│ elevenlabs_conversation_id          │
│ direction (inbound/outbound)        │
│ status (completed/failed)           │
│ from_phone                          │
│ to_phone                            │
│ summary                             │
│ transcript                          │
│ duration                            │
│ recording_url                       │
│ recording_expires_at                │
│ started_at                          │
│ ended_at                            │
│ created_at                          │
└─────────────────────────────────────┘

┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│  campaigns  │       │   uploads   │       │    jobs     │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id (PK)     │◄──────│ campaign_id │◄──────│ upload_id   │
│ name        │       │ id (PK)     │       │ id (PK)     │
│ description │       │ filename    │       │ agent_id    │
│ created_at  │       │ total_rows  │       │ campaign_id │
│ updated_at  │       │ created_at  │       │ status      │
└─────────────┘       └─────────────┘       │ total_calls │
                             │              │ completed   │
                             ▼              │ failed      │
                      ┌─────────────┐       │ started_at  │
                      │batch_contacts│      │ finished_at │
                      ├─────────────┤       │ created_at  │
                      │ id (PK)     │       └─────────────┘
                      │ upload_id   │              │
                      │ phone       │              ▼
                      │ name        │       ┌─────────────┐
                      │ variables   │       │  job_calls  │
                      │ created_at  │       ├─────────────┤
                      └─────────────┘       │ id (PK)     │
                                            │ job_id (FK) │
                                            │ call_id (FK)│
                                            │ batch_contact_id│
                                            │ status      │
                                            │ created_at  │
                                            └─────────────┘

┌─────────────────────────────────────┐
│          custom_functions           │
├─────────────────────────────────────┤
│ id (PK)                             │
│ agent_id (FK)                       │
│ name                                │
│ description                         │
│ endpoint                            │
│ method (GET/POST/PUT/PATCH/DELETE)  │
│ headers (JSON)                      │
│ auth_type (none/api_key/bearer/basic)│
│ auth_config (JSON, encrypted)       │
│ parameters (JSON Schema)            │
│ response_mapping (JSON)             │
│ enabled                             │
│ created_at                          │
│ updated_at                          │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│             settings                │
├─────────────────────────────────────┤
│ id (PK)                             │
│ key (unique)                        │
│ value (JSON)                        │
│ updated_at                          │
└─────────────────────────────────────┘
```

---

## Table Definitions

### agents

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PK, UUID | Unique identifier |
| name | TEXT | NOT NULL | Display name |
| description | TEXT | | Optional description |
| system_prompt | TEXT | NOT NULL | Full system prompt for agent |
| template | TEXT | | Template used: 'property_sales', 'property_manager', 'custom' |
| greeting_message | TEXT | | Opening message when call starts |
| enabled | INTEGER | DEFAULT 1 | 1 = active, 0 = disabled |
| elevenlabs_agent_id | TEXT | | Synced ElevenLabs agent ID |
| created_at | TEXT | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TEXT | DEFAULT CURRENT_TIMESTAMP | |

---

### contacts

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PK, UUID | Unique identifier |
| name | TEXT | NOT NULL | Contact name |
| phone | TEXT | NOT NULL, UNIQUE | E.164 format (+61...) |
| notes | TEXT | | Free-form notes |
| tags | TEXT | | JSON array of tags |
| created_at | TEXT | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TEXT | DEFAULT CURRENT_TIMESTAMP | |

**Indexes:**
- `idx_contacts_phone` on `phone`
- `idx_contacts_name` on `name`

---

### memories

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PK, UUID | Unique identifier |
| contact_id | TEXT | FK → contacts.id, NOT NULL | Parent contact |
| content | TEXT | NOT NULL | Memory content (fact/preference) |
| source | TEXT | | 'auto' (from call) or 'manual' |
| call_id | TEXT | FK → calls.id | Source call if auto-generated |
| created_at | TEXT | DEFAULT CURRENT_TIMESTAMP | |

**Indexes:**
- `idx_memories_contact` on `contact_id`

---

### calls

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PK, UUID | Unique identifier |
| agent_id | TEXT | FK → agents.id, NOT NULL | Agent that handled call |
| contact_id | TEXT | FK → contacts.id | Matched contact (nullable) |
| elevenlabs_conversation_id | TEXT | UNIQUE | ElevenLabs conversation ID |
| direction | TEXT | NOT NULL | 'inbound' or 'outbound' |
| status | TEXT | NOT NULL | 'completed', 'failed', 'no_answer' |
| from_phone | TEXT | NOT NULL | Caller number (E.164) |
| to_phone | TEXT | NOT NULL | Recipient number (E.164) |
| summary | TEXT | | AI-generated call summary |
| transcript | TEXT | | Full transcript (JSON array) |
| duration | INTEGER | | Duration in seconds |
| recording_url | TEXT | | ElevenLabs recording URL |
| recording_expires_at | TEXT | | Recording URL expiry |
| sms_sent | INTEGER | DEFAULT 0 | 1 if post-call SMS sent |
| sms_sent_at | TEXT | | When SMS was sent |
| started_at | TEXT | | Call start time |
| ended_at | TEXT | | Call end time |
| created_at | TEXT | DEFAULT CURRENT_TIMESTAMP | |

**Indexes:**
- `idx_calls_agent` on `agent_id`
- `idx_calls_contact` on `contact_id`
- `idx_calls_phone` on `from_phone`
- `idx_calls_date` on `created_at`
- `idx_calls_elevenlabs` on `elevenlabs_conversation_id`

---

### campaigns

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PK, UUID | Unique identifier |
| name | TEXT | NOT NULL | Campaign name |
| description | TEXT | | Optional description |
| created_at | TEXT | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TEXT | DEFAULT CURRENT_TIMESTAMP | |

---

### uploads

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PK, UUID | Unique identifier |
| campaign_id | TEXT | FK → campaigns.id, NOT NULL | Parent campaign |
| filename | TEXT | NOT NULL | Original filename |
| total_rows | INTEGER | NOT NULL | Number of contacts |
| created_at | TEXT | DEFAULT CURRENT_TIMESTAMP | |

---

### batch_contacts

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PK, UUID | Unique identifier |
| upload_id | TEXT | FK → uploads.id, NOT NULL | Parent upload |
| phone | TEXT | NOT NULL | Phone number (E.164) |
| name | TEXT | | Contact name if provided |
| variables | TEXT | | JSON object of custom variables |
| created_at | TEXT | DEFAULT CURRENT_TIMESTAMP | |

**Indexes:**
- `idx_batch_contacts_upload` on `upload_id`

---

### jobs

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PK, UUID | Unique identifier |
| campaign_id | TEXT | FK → campaigns.id, NOT NULL | Parent campaign |
| upload_id | TEXT | FK → uploads.id, NOT NULL | Source upload |
| agent_id | TEXT | FK → agents.id, NOT NULL | Agent to use |
| status | TEXT | NOT NULL | 'pending', 'running', 'completed', 'failed', 'cancelled' |
| total_calls | INTEGER | DEFAULT 0 | Total calls to make |
| completed_calls | INTEGER | DEFAULT 0 | Successful calls |
| failed_calls | INTEGER | DEFAULT 0 | Failed calls |
| started_at | TEXT | | Job start time |
| finished_at | TEXT | | Job completion time |
| created_at | TEXT | DEFAULT CURRENT_TIMESTAMP | |

**Indexes:**
- `idx_jobs_campaign` on `campaign_id`
- `idx_jobs_status` on `status`

---

### job_calls

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PK, UUID | Unique identifier |
| job_id | TEXT | FK → jobs.id, NOT NULL | Parent job |
| batch_contact_id | TEXT | FK → batch_contacts.id, NOT NULL | Contact being called |
| call_id | TEXT | FK → calls.id | Resulting call record |
| status | TEXT | NOT NULL | 'pending', 'calling', 'completed', 'failed' |
| error_message | TEXT | | Error if failed |
| created_at | TEXT | DEFAULT CURRENT_TIMESTAMP | |

**Indexes:**
- `idx_job_calls_job` on `job_id`

---

### custom_functions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PK, UUID | Unique identifier |
| agent_id | TEXT | FK → agents.id, NOT NULL | Parent agent |
| name | TEXT | NOT NULL | Function name (unique per agent) |
| description | TEXT | NOT NULL | Description for LLM |
| endpoint | TEXT | NOT NULL | API endpoint URL |
| method | TEXT | NOT NULL | HTTP method |
| headers | TEXT | | JSON object of headers |
| auth_type | TEXT | DEFAULT 'none' | 'none', 'api_key', 'bearer', 'basic' |
| auth_config | TEXT | | JSON auth configuration |
| parameters | TEXT | | JSON Schema for parameters |
| response_mapping | TEXT | | JSON mapping rules |
| timeout | INTEGER | DEFAULT 30 | Timeout in seconds |
| enabled | INTEGER | DEFAULT 1 | 1 = active |
| created_at | TEXT | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TEXT | DEFAULT CURRENT_TIMESTAMP | |

**Indexes:**
- `idx_functions_agent` on `agent_id`

---

### settings

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PK, UUID | Unique identifier |
| key | TEXT | NOT NULL, UNIQUE | Setting key |
| value | TEXT | NOT NULL | JSON value |
| updated_at | TEXT | DEFAULT CURRENT_TIMESTAMP | |

**Default Settings:**
```json
{
  "sms_template": "Hi {caller_name}, thanks for calling! Here's a summary of our conversation: {call_summary}. Feel free to call back anytime. - {agent_name}",
  "sms_enabled": true,
  "sms_skip_silent": true,
  "auto_create_contacts": true,
  "save_memories": true
}
```

---

## Drizzle Schema (TypeScript)

```typescript
// lib/db/schema.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { createId } from '@paralleldrive/cuid2';

export const agents = sqliteTable('agents', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull(),
  description: text('description'),
  systemPrompt: text('system_prompt').notNull(),
  template: text('template'),
  greetingMessage: text('greeting_message'),
  enabled: integer('enabled').default(1),
  elevenlabsAgentId: text('elevenlabs_agent_id'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export const contacts = sqliteTable('contacts', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull(),
  phone: text('phone').notNull().unique(),
  notes: text('notes'),
  tags: text('tags'), // JSON array
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export const memories = sqliteTable('memories', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  contactId: text('contact_id').notNull().references(() => contacts.id),
  content: text('content').notNull(),
  source: text('source'), // 'auto' or 'manual'
  callId: text('call_id').references(() => calls.id),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const calls = sqliteTable('calls', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  agentId: text('agent_id').notNull().references(() => agents.id),
  contactId: text('contact_id').references(() => contacts.id),
  elevenlabsConversationId: text('elevenlabs_conversation_id').unique(),
  direction: text('direction').notNull(), // 'inbound' | 'outbound'
  status: text('status').notNull(), // 'completed' | 'failed' | 'no_answer'
  fromPhone: text('from_phone').notNull(),
  toPhone: text('to_phone').notNull(),
  summary: text('summary'),
  transcript: text('transcript'), // JSON
  duration: integer('duration'),
  recordingUrl: text('recording_url'),
  recordingExpiresAt: text('recording_expires_at'),
  smsSent: integer('sms_sent').default(0),
  smsSentAt: text('sms_sent_at'),
  startedAt: text('started_at'),
  endedAt: text('ended_at'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const campaigns = sqliteTable('campaigns', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export const uploads = sqliteTable('uploads', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  campaignId: text('campaign_id').notNull().references(() => campaigns.id),
  filename: text('filename').notNull(),
  totalRows: integer('total_rows').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const batchContacts = sqliteTable('batch_contacts', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  uploadId: text('upload_id').notNull().references(() => uploads.id),
  phone: text('phone').notNull(),
  name: text('name'),
  variables: text('variables'), // JSON
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const jobs = sqliteTable('jobs', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  campaignId: text('campaign_id').notNull().references(() => campaigns.id),
  uploadId: text('upload_id').notNull().references(() => uploads.id),
  agentId: text('agent_id').notNull().references(() => agents.id),
  status: text('status').notNull(), // 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  totalCalls: integer('total_calls').default(0),
  completedCalls: integer('completed_calls').default(0),
  failedCalls: integer('failed_calls').default(0),
  startedAt: text('started_at'),
  finishedAt: text('finished_at'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const jobCalls = sqliteTable('job_calls', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  jobId: text('job_id').notNull().references(() => jobs.id),
  batchContactId: text('batch_contact_id').notNull().references(() => batchContacts.id),
  callId: text('call_id').references(() => calls.id),
  status: text('status').notNull(), // 'pending' | 'calling' | 'completed' | 'failed'
  errorMessage: text('error_message'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const customFunctions = sqliteTable('custom_functions', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  agentId: text('agent_id').notNull().references(() => agents.id),
  name: text('name').notNull(),
  description: text('description').notNull(),
  endpoint: text('endpoint').notNull(),
  method: text('method').notNull(),
  headers: text('headers'), // JSON
  authType: text('auth_type').default('none'),
  authConfig: text('auth_config'), // JSON
  parameters: text('parameters'), // JSON Schema
  responseMapping: text('response_mapping'), // JSON
  timeout: integer('timeout').default(30),
  enabled: integer('enabled').default(1),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export const settings = sqliteTable('settings', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  key: text('key').notNull().unique(),
  value: text('value').notNull(), // JSON
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});
```
