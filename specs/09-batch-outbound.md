# Batch Outbound Calling Specification

## Overview
Batch outbound calling allows running automated call campaigns to lists of contacts. Users upload CSV files, configure campaigns, create jobs, and execute them sequentially.

---

## Core Entities

### Campaign
Container for organizing batch calls.

| Field | Description |
|-------|-------------|
| id | Unique identifier |
| name | Campaign name |
| description | Optional description |

### Upload
CSV file uploaded to a campaign.

| Field | Description |
|-------|-------------|
| id | Unique identifier |
| campaignId | Parent campaign |
| filename | Original filename |
| totalRows | Number of contacts |

### Batch Contact
Individual contact from an upload.

| Field | Description |
|-------|-------------|
| id | Unique identifier |
| uploadId | Parent upload |
| phone | Phone number (E.164) |
| name | Contact name (optional) |
| variables | Custom variables (JSON) |

### Job
Execution of calls from an upload.

| Field | Description |
|-------|-------------|
| id | Unique identifier |
| campaignId | Parent campaign |
| uploadId | Source upload |
| agentId | Agent to use |
| status | pending/running/completed/failed/cancelled |
| totalCalls | Total calls to make |
| completedCalls | Successful calls |
| failedCalls | Failed calls |
| startedAt | Job start time |
| finishedAt | Job completion time |

### Job Call
Individual call within a job.

| Field | Description |
|-------|-------------|
| id | Unique identifier |
| jobId | Parent job |
| batchContactId | Contact being called |
| callId | Resulting call record |
| status | pending/calling/completed/failed |
| errorMessage | Error if failed |

---

## User Flow

```
1. Create Campaign (or select existing)
          │
          ▼
2. Upload CSV file
          │
          ▼
3. System parses and stores batch contacts
          │
          ▼
4. Create Job (select agent, upload)
          │
          ▼
5. Run Job
          │
          ▼
6. Calls executed sequentially
          │
          ▼
7. View results / download report
```

---

## CSV Format

### Required Column
- `phone` or `phone_number`

### Optional Columns
- `name` - Contact name
- Any custom columns become variables

### Example CSV
```csv
phone,name,property_address,inspection_time
+61412345678,John Smith,45 Beach St,Saturday 2pm
+61423456789,Jane Doe,123 Main Rd,Sunday 10am
0434567890,Bob Wilson,78 Park Ave,Saturday 4pm
```

### Parsing Rules
1. First row is headers
2. Phone numbers normalized to E.164
3. Invalid phones logged but row skipped
4. Empty rows skipped
5. Custom columns stored in `variables` JSON

---

## CSV Upload Flow

```typescript
async function uploadCSV(campaignId: string, file: File): Promise<Upload> {
  const text = await file.text();
  const rows = parseCSV(text);

  // Create upload record
  const upload = await db.insert(uploads).values({
    campaignId,
    filename: file.name,
    totalRows: rows.length
  }).returning().get();

  // Process rows
  const batchContacts = [];
  const errors = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const phone = formatPhoneE164(row.phone || row.phone_number);

    if (!phone) {
      errors.push({ row: i + 2, error: 'Invalid phone number' });
      continue;
    }

    // Extract variables (all columns except phone and name)
    const variables = { ...row };
    delete variables.phone;
    delete variables.phone_number;
    delete variables.name;

    batchContacts.push({
      uploadId: upload.id,
      phone,
      name: row.name || null,
      variables: Object.keys(variables).length > 0 ? JSON.stringify(variables) : null
    });
  }

  // Batch insert contacts
  if (batchContacts.length > 0) {
    await db.insert(batchContactsTable).values(batchContacts);
  }

  // Update upload with actual count
  await db.update(uploads)
    .set({ totalRows: batchContacts.length })
    .where(eq(uploads.id, upload.id));

  return { upload, errors };
}
```

---

## Job Execution

### Execution Flow

```typescript
async function runJob(jobId: string) {
  const job = await db.query.jobs.findFirst({
    where: eq(jobs.id, jobId),
    with: {
      agent: true,
      upload: {
        with: { batchContacts: true }
      }
    }
  });

  // Update job status
  await db.update(jobs)
    .set({
      status: 'running',
      startedAt: new Date().toISOString()
    })
    .where(eq(jobs.id, jobId));

  // Create job_calls for each contact
  const jobCalls = job.upload.batchContacts.map(contact => ({
    jobId,
    batchContactId: contact.id,
    status: 'pending'
  }));

  await db.insert(jobCallsTable).values(jobCalls);

  // Process sequentially
  for (const jobCall of await db.query.jobCalls.findMany({
    where: eq(jobCalls.jobId, jobId)
  })) {
    // Check if job was cancelled
    const currentJob = await db.query.jobs.findFirst({
      where: eq(jobs.id, jobId)
    });

    if (currentJob.status === 'cancelled') {
      break;
    }

    // Update job call status
    await db.update(jobCallsTable)
      .set({ status: 'calling' })
      .where(eq(jobCalls.id, jobCall.id));

    // Get batch contact
    const batchContact = await db.query.batchContacts.findFirst({
      where: eq(batchContacts.id, jobCall.batchContactId)
    });

    try {
      // Initiate outbound call
      const result = await initiateOutboundCall({
        agentId: job.agentId,
        toPhone: batchContact.phone,
        variables: JSON.parse(batchContact.variables || '{}')
      });

      // Update job call
      await db.update(jobCallsTable)
        .set({
          status: 'completed',
          callId: result.callId
        })
        .where(eq(jobCalls.id, jobCall.id));

      // Update job counts
      await db.update(jobs)
        .set({ completedCalls: sql`completed_calls + 1` })
        .where(eq(jobs.id, jobId));

    } catch (error) {
      await db.update(jobCallsTable)
        .set({
          status: 'failed',
          errorMessage: error.message
        })
        .where(eq(jobCalls.id, jobCall.id));

      await db.update(jobs)
        .set({ failedCalls: sql`failed_calls + 1` })
        .where(eq(jobs.id, jobId));
    }

    // Wait between calls (rate limiting)
    await sleep(5000); // 5 second delay
  }

  // Mark job complete
  await db.update(jobs)
    .set({
      status: 'completed',
      finishedAt: new Date().toISOString()
    })
    .where(eq(jobs.id, jobId));
}
```

### Concurrency
- Sequential execution (one call at a time)
- 5 second delay between calls
- Future: configurable concurrency (2-3 parallel)

---

## Dynamic Variables in Prompts

Custom variables from CSV can be used in agent prompts during outbound calls.

### Injection

When initiating outbound call, variables are passed to ElevenLabs:

```typescript
await elevenlabs.startOutboundCall({
  agent_id: agent.elevenlabsAgentId,
  to_number: phone,
  custom_llm_extra_body: {
    // Batch variables
    property_address: variables.property_address,
    inspection_time: variables.inspection_time,
    contact_name: batchContact.name
  }
});
```

### Prompt Usage

Agent prompt can reference:
```markdown
You are calling {contact_name} about an upcoming inspection.

Property: {property_address}
Scheduled time: {inspection_time}

Confirm their attendance and answer any questions.
```

---

## Campaigns UI

### Campaign List (`/dashboard/campaigns`)

**Layout:**
- Header with "Campaigns" title and "New Campaign" button
- Table view:
  - Name
  - Description preview
  - Uploads count
  - Jobs count
  - Last activity
  - Actions
- Click row → campaign detail

### Campaign Detail (`/dashboard/campaigns/[id]`)

**Sections:**

1. **Campaign Info**
   - Name (editable)
   - Description (editable)
   - Created date

2. **Uploads Section**
   - List of uploaded CSVs
   - Each shows: filename, total contacts, upload date
   - "Upload CSV" button
   - Delete upload (if no jobs running)

3. **Jobs Section**
   - List of jobs
   - Each shows: status badge, agent name, progress (X/Y completed), date
   - "New Job" button → modal to select agent and upload
   - Click job → job detail
   - Actions: Run, Cancel, Delete

### Create Campaign Modal

**Fields:**
- Name (required)
- Description (optional)

### Upload CSV Modal

**Flow:**
1. File drop zone or browse button
2. Upload and parse
3. Show preview (first 5 rows)
4. Show validation (X valid, Y invalid)
5. Confirm upload

### Create Job Modal

**Fields:**
- Select Agent (dropdown)
- Select Upload (dropdown, shows contact count)
- Confirm button

### Job Detail (`/dashboard/campaigns/[id]/jobs/[jobId]`)

**Layout:**
- Back link
- Job status banner (pending/running/completed/failed)
- Progress bar

**Sections:**

1. **Overview**
   - Agent name
   - Upload filename
   - Start/end times
   - Duration
   - Stats: total, completed, failed

2. **Call Results Table**
   - Contact phone
   - Contact name
   - Status badge
   - Duration (if completed)
   - Error message (if failed)
   - Link to call detail (if completed)

3. **Actions**
   - Run (if pending)
   - Cancel (if running)
   - Download Report (CSV export)

---

## Job Report Export

Export job results as CSV:

```csv
phone,name,status,duration,error,call_id
+61412345678,John Smith,completed,145,,call_abc123
+61423456789,Jane Doe,completed,98,,call_def456
+61434567890,Bob Wilson,failed,,"No answer",
```

---

## API Endpoints

### Campaigns

#### GET /api/campaigns
List campaigns.

#### POST /api/campaigns
Create campaign.

#### GET /api/campaigns/[id]
Get campaign with uploads and jobs.

#### PATCH /api/campaigns/[id]
Update campaign.

#### DELETE /api/campaigns/[id]
Delete campaign (cascade delete uploads, jobs).

### Uploads

#### POST /api/campaigns/[id]/uploads
Upload CSV.

**Request:** FormData with `file` field

**Response:**
```json
{
  "upload": {
    "id": "...",
    "filename": "contacts.csv",
    "totalRows": 150
  },
  "errors": [
    { "row": 5, "error": "Invalid phone number" }
  ]
}
```

#### GET /api/uploads/[id]
Get upload with contacts preview.

#### DELETE /api/uploads/[id]
Delete upload (only if no running jobs).

### Jobs

#### POST /api/campaigns/[id]/jobs
Create job.

**Request:**
```json
{
  "agentId": "...",
  "uploadId": "..."
}
```

#### GET /api/jobs/[id]
Get job with calls.

#### POST /api/jobs/[id]/run
Start job execution.

#### POST /api/jobs/[id]/cancel
Cancel running job.

#### GET /api/jobs/[id]/report
Download job report CSV.

---

## Status Badges

| Status | Color | Description |
|--------|-------|-------------|
| pending | gray | Not started |
| running | blue | In progress |
| completed | green | All calls done |
| failed | red | Job failed |
| cancelled | yellow | Manually stopped |

---

## Error Handling

| Scenario | Handling |
|----------|----------|
| CSV parse error | Show error, reject upload |
| Invalid phone in row | Skip row, log error, continue |
| Call fails | Mark as failed, continue to next |
| Job cancelled mid-run | Stop after current call |
| Agent deleted | Job fails to run |
