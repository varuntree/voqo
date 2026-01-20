# Contacts & Memories Specification

## Overview
Contacts store caller information. Memories store per-contact facts that persist across calls and are injected into agent prompts for personalized conversations.

---

## Contacts

### Data Model

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Auto | Unique identifier |
| name | string | Yes | Contact name |
| phone | string | Yes | Phone number (E.164, unique) |
| notes | string | No | Free-form notes |
| tags | string[] | No | Array of tags for filtering |
| createdAt | datetime | Auto | Creation timestamp |
| updatedAt | datetime | Auto | Last update timestamp |

### Phone Number Handling

- Stored in E.164 format: `+61412345678`
- Validated on create/update
- Unique constraint (one contact per phone)
- Used for matching incoming calls

### Tags

Tags are stored as JSON array:
```json
["buyer", "high-priority", "bondi-area"]
```

Suggested default tags:
- `buyer` / `seller` / `tenant` / `landlord`
- `high-priority` / `low-priority`
- `follow-up-needed`
- `inspection-scheduled`

---

## Contact UI

### Contact List (`/dashboard/contacts`)

**Layout:**
- Header with "Contacts" title and actions
- Search bar (searches name and phone)
- Filter dropdown (by tags)
- Table view with columns:
  - Name
  - Phone
  - Tags (badges)
  - Last Contact (date of last call)
  - Actions (view, call, delete)
- Pagination

**Actions:**
- "Add Contact" button → modal or new page
- "Import CSV" button → file upload modal
- Click row → navigate to detail
- Call icon → initiate outbound call
- Delete icon → confirmation modal

### Contact Detail (`/dashboard/contacts/[id]`)

**Layout:**
- Header with contact name and actions
- Back link to list

**Sections:**

1. **Contact Info Card**
   - Name (editable)
   - Phone (editable)
   - Tags (editable, multi-select)
   - Notes (editable textarea)
   - Save button

2. **Memories Section**
   - List of memories (cards)
   - Each memory shows:
     - Content
     - Source (auto/manual)
     - Created date
     - Delete button
   - "Add Memory" button → inline input

3. **Call History Section**
   - List of calls with this contact
   - Shows: date, direction, duration, summary preview
   - Click → navigate to call detail

**Actions:**
- Save changes
- Delete contact (confirmation)
- Call contact → initiate outbound call

### Add Contact Modal

**Fields:**
- Name (required)
- Phone (required, validated)
- Notes (optional)
- Tags (optional, multi-select)

---

## CSV Import

### Import Flow

1. User clicks "Import CSV"
2. File upload modal opens
3. User selects CSV file
4. System parses and validates
5. Preview shown with validation status
6. User confirms import
7. Contacts created (skip duplicates)

### CSV Format

**Required Column:**
- `phone` or `phone_number`

**Optional Columns:**
- `name`
- `notes`
- `tags` (comma-separated)

**Example:**
```csv
name,phone,notes,tags
John Smith,+61412345678,Interested in Bondi properties,"buyer,high-priority"
Jane Doe,0423456789,Tenant at 45 Beach St,tenant
```

### Import Logic

```typescript
async function importCSV(file: File): Promise<ImportResult> {
  const text = await file.text();
  const rows = parseCSV(text);

  const results = {
    total: rows.length,
    created: 0,
    skipped: 0,
    errors: []
  };

  for (const row of rows) {
    const phone = formatPhoneE164(row.phone || row.phone_number);

    if (!phone) {
      results.errors.push({ row, error: 'Invalid phone number' });
      continue;
    }

    // Check for existing
    const existing = await db.query.contacts.findFirst({
      where: eq(contacts.phone, phone)
    });

    if (existing) {
      results.skipped++;
      continue;
    }

    // Create contact
    await db.insert(contacts).values({
      name: row.name || 'Unknown',
      phone,
      notes: row.notes,
      tags: row.tags ? JSON.stringify(row.tags.split(',').map(t => t.trim())) : null
    });

    results.created++;
  }

  return results;
}
```

---

## Memories

### Data Model

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Auto | Unique identifier |
| contactId | UUID | Yes | Parent contact |
| content | string | Yes | Memory content |
| source | enum | Yes | 'auto' or 'manual' |
| callId | UUID | No | Source call (if auto) |
| createdAt | datetime | Auto | Creation timestamp |

### Memory Content Guidelines

Good memories are:
- Specific and actionable
- Relevant to future conversations
- Factual (preferences, interests, history)

**Examples:**
- "Interested in 3-bedroom properties in Bondi area"
- "Budget around $1.5M"
- "Has two school-age children, needs good school zone"
- "Prefers Saturday morning inspections"
- "Previously inquired about 45 Beach St (sold)"
- "Works from home, needs dedicated office space"

**Not good memories:**
- "Nice person" (subjective)
- "Called on Tuesday" (redundant with call history)
- "Said hello" (not useful)

---

## Auto Memory Extraction

After each call, memories are automatically extracted from the conversation.

### Extraction Prompt

```markdown
Analyze this call transcript and extract key facts about the caller that would be useful to remember for future calls.

Focus on:
- Property preferences (size, location, features)
- Budget or price range
- Timeline (when they want to buy/sell/move)
- Family situation (if mentioned)
- Specific properties discussed
- Scheduling preferences
- Any commitments made
- Important concerns or requirements

Format each memory as a single, clear sentence.
Return as JSON array of strings.

Transcript:
{transcript}

Previous memories (avoid duplicates):
{existing_memories}
```

### Extraction Process

```typescript
async function extractAndSaveMemories(
  contactId: string,
  callId: string,
  payload: PostCallPayload
) {
  // Get existing memories
  const existingMemories = await db.query.memories.findMany({
    where: eq(memories.contactId, contactId)
  });

  const existingContent = existingMemories.map(m => m.content);

  // Format transcript
  const transcriptText = payload.transcript
    .map(t => `${t.role}: ${t.message}`)
    .join('\n');

  // Call LLM for extraction (can use ElevenLabs or OpenAI)
  const extracted = await extractMemoriesWithLLM(transcriptText, existingContent);

  // Save new memories
  for (const content of extracted) {
    // Skip if too similar to existing
    if (isSimilarToExisting(content, existingContent)) {
      continue;
    }

    await db.insert(memories).values({
      contactId,
      content,
      source: 'auto',
      callId
    });
  }
}
```

---

## Memory Injection

When a call starts (or for outbound), memories are injected into the agent's context.

### Format

```markdown
# Caller Context

**Contact:** {contact.name}
**Phone:** {contact.phone}

**Previous Interactions:**
{memories as bullet points}

**Notes:**
{contact.notes}
```

### Example

```markdown
# Caller Context

**Contact:** John Smith
**Phone:** +61412345678

**Previous Interactions:**
- Interested in 3-bedroom properties in Bondi area
- Budget around $1.5M
- Has two school-age children, needs good school zone
- Prefers Saturday morning inspections
- Previously inquired about 45 Beach St (sold)

**Notes:**
High-priority buyer, referred by existing client Sarah Jones.
```

---

## API Endpoints

### GET /api/contacts
List contacts with filtering.

**Query Params:**
- `search` - Search name/phone
- `tags` - Filter by tags (comma-separated)
- `page` - Page number
- `limit` - Items per page

**Response:**
```json
{
  "contacts": [...],
  "total": 150,
  "page": 1,
  "totalPages": 15
}
```

### POST /api/contacts
Create contact.

**Request:**
```json
{
  "name": "John Smith",
  "phone": "+61412345678",
  "notes": "Referred by Sarah",
  "tags": ["buyer", "high-priority"]
}
```

### GET /api/contacts/[id]
Get contact with memories and recent calls.

**Response:**
```json
{
  "contact": {
    "id": "...",
    "name": "John Smith",
    "phone": "+61412345678",
    "notes": "...",
    "tags": ["buyer"],
    "createdAt": "...",
    "updatedAt": "..."
  },
  "memories": [...],
  "recentCalls": [...]
}
```

### PATCH /api/contacts/[id]
Update contact.

### DELETE /api/contacts/[id]
Delete contact (cascades to memories).

### POST /api/contacts/import
Import contacts from CSV.

**Request:** FormData with `file` field

**Response:**
```json
{
  "total": 100,
  "created": 85,
  "skipped": 10,
  "errors": [
    { "row": 5, "error": "Invalid phone number" }
  ]
}
```

### POST /api/contacts/[id]/memories
Add memory to contact.

**Request:**
```json
{
  "content": "Prefers email communication"
}
```

### DELETE /api/contacts/[id]/memories/[memoryId]
Delete a memory.

---

## Contact Matching

When a call comes in, match caller to existing contact:

```typescript
async function matchContact(phone: string): Promise<Contact | null> {
  // Normalize phone
  const normalized = formatPhoneE164(phone);
  if (!normalized) return null;

  // Exact match
  return await db.query.contacts.findFirst({
    where: eq(contacts.phone, normalized)
  });
}
```

---

## Auto Contact Creation

When enabled (setting: `auto_create_contacts`), unknown callers are automatically added:

```typescript
async function getOrCreateContact(phone: string): Promise<Contact> {
  const existing = await matchContact(phone);
  if (existing) return existing;

  const autoCreate = await getSetting('auto_create_contacts');
  if (!autoCreate) return null;

  return await db.insert(contacts).values({
    name: 'Unknown Caller',
    phone: formatPhoneE164(phone)
  }).returning().get();
}
```
