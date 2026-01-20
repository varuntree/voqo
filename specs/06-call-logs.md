# Call Logs Specification

## Overview
Call logs store the history of all calls handled by agents, including transcripts, summaries, and recordings.

---

## Data Model

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique identifier |
| agentId | UUID | Agent that handled the call |
| contactId | UUID | Matched contact (nullable) |
| elevenlabsConversationId | string | ElevenLabs conversation ID |
| direction | enum | 'inbound' or 'outbound' |
| status | enum | 'completed', 'failed', 'no_answer' |
| fromPhone | string | Caller phone (E.164) |
| toPhone | string | Recipient phone (E.164) |
| summary | string | AI-generated summary |
| transcript | JSON | Full transcript array |
| duration | integer | Duration in seconds |
| recordingUrl | string | ElevenLabs recording URL |
| recordingExpiresAt | datetime | When recording URL expires |
| smsSent | boolean | Whether post-call SMS was sent |
| smsSentAt | datetime | When SMS was sent |
| startedAt | datetime | Call start time |
| endedAt | datetime | Call end time |
| createdAt | datetime | Record creation time |

---

## Transcript Format

Transcript is stored as JSON array:

```json
[
  {
    "role": "agent",
    "message": "Hello! Thanks for calling Ray White Sydney. This is Lisa, how can I help you today?",
    "timestamp": 0.0
  },
  {
    "role": "user",
    "message": "Hi, I'm calling about the property on Beach Street",
    "timestamp": 3.5
  },
  {
    "role": "agent",
    "message": "Of course! Are you referring to 45 Beach Street in Bondi?",
    "timestamp": 6.2
  },
  {
    "role": "user",
    "message": "Yes, that's the one. Is it still available?",
    "timestamp": 9.8
  },
  {
    "role": "function_call",
    "function": "check_property_status",
    "parameters": { "address": "45 Beach Street, Bondi" },
    "result": { "status": "available", "price": "$1.8M" },
    "timestamp": 12.1
  },
  {
    "role": "agent",
    "message": "Yes, 45 Beach Street is still available. It's listed at $1.8 million. Would you like to schedule an inspection?",
    "timestamp": 14.5
  }
]
```

---

## Call Status

| Status | Description |
|--------|-------------|
| completed | Call connected and conversation occurred |
| failed | Call failed to connect |
| no_answer | Outbound call not answered |
| initiated | Outbound call in progress (temporary) |

---

## Call Logs UI

### Call Log List (`/dashboard/calls`)

**Layout:**
- Header with "Call Logs" title
- Filter bar:
  - Date range picker
  - Direction filter (All / Inbound / Outbound)
  - Agent filter dropdown
  - Status filter
  - Search by phone or contact name
- Table view with columns:
  - Direction icon (↓ inbound, ↑ outbound)
  - Contact/Phone
  - Agent
  - Duration
  - Date/Time
  - Status badge
  - Summary preview (truncated)
- Click row → navigate to detail
- Pagination

**Sorting:**
- Default: newest first
- Sortable by: date, duration

### Call Detail (`/dashboard/calls/[id]`)

**Layout:**
- Back link to list
- Header with call info

**Sections:**

1. **Call Overview Card**
   - Direction badge
   - Status badge
   - Duration (formatted: "2m 25s")
   - Date/time
   - Phone numbers (from → to)
   - Agent name (linked)
   - Contact name (linked, if matched)

2. **Summary Section**
   - AI-generated summary
   - Copy button

3. **Recording Section** (if available)
   - Audio player
   - Note: "Recording expires on {date}"

4. **Transcript Section**
   - Chat-style display
   - Agent messages on left (styled differently)
   - User messages on right
   - Function calls shown as system messages
   - Timestamps shown
   - Copy full transcript button

5. **Post-call Actions Section**
   - SMS status (sent/not sent)
   - If sent: timestamp and preview

---

## Recording Handling

Recordings are stored by ElevenLabs and accessed via temporary URLs.

### URL Lifecycle
- URLs expire after ~7 days
- No local storage for MVP
- Show warning when near expiry
- After expiry, show "Recording no longer available"

### Audio Player Component

```tsx
function RecordingPlayer({ url, expiresAt }: { url: string; expiresAt: string }) {
  const isExpired = new Date(expiresAt) < new Date();
  const isExpiringSoon = new Date(expiresAt) < new Date(Date.now() + 24 * 60 * 60 * 1000);

  if (isExpired) {
    return (
      <div className="text-muted-foreground">
        Recording no longer available
      </div>
    );
  }

  return (
    <div>
      {isExpiringSoon && (
        <Alert variant="warning">
          Recording expires soon
        </Alert>
      )}
      <audio controls src={url} className="w-full" />
    </div>
  );
}
```

---

## Transcript Display

### Chat-style Component

```tsx
function TranscriptView({ transcript }: { transcript: TranscriptEntry[] }) {
  return (
    <div className="space-y-4">
      {transcript.map((entry, i) => (
        <TranscriptMessage key={i} entry={entry} />
      ))}
    </div>
  );
}

function TranscriptMessage({ entry }: { entry: TranscriptEntry }) {
  if (entry.role === 'function_call') {
    return (
      <div className="mx-auto max-w-md rounded-lg bg-muted p-3 text-sm">
        <div className="font-medium">Function: {entry.function}</div>
        <div className="text-muted-foreground">
          Result: {JSON.stringify(entry.result)}
        </div>
      </div>
    );
  }

  const isAgent = entry.role === 'agent';

  return (
    <div className={cn(
      "flex",
      isAgent ? "justify-start" : "justify-end"
    )}>
      <div className={cn(
        "max-w-[80%] rounded-lg p-3",
        isAgent ? "bg-secondary" : "bg-primary text-primary-foreground"
      )}>
        <div className="text-sm">{entry.message}</div>
        <div className="mt-1 text-xs opacity-70">
          {formatTimestamp(entry.timestamp)}
        </div>
      </div>
    </div>
  );
}
```

---

## API Endpoints

### GET /api/calls
List calls with filtering.

**Query Params:**
- `agentId` - Filter by agent
- `contactId` - Filter by contact
- `direction` - 'inbound' | 'outbound'
- `status` - 'completed' | 'failed' | 'no_answer'
- `from` - Start date (ISO)
- `to` - End date (ISO)
- `search` - Search phone or contact name
- `page` - Page number
- `limit` - Items per page

**Response:**
```json
{
  "calls": [
    {
      "id": "...",
      "direction": "inbound",
      "status": "completed",
      "fromPhone": "+61412345678",
      "toPhone": "+61400000000",
      "duration": 145,
      "summary": "Caller inquired about...",
      "startedAt": "2024-01-15T10:00:00Z",
      "agent": {
        "id": "...",
        "name": "Lisa - Sales"
      },
      "contact": {
        "id": "...",
        "name": "John Smith"
      }
    }
  ],
  "total": 500,
  "page": 1,
  "totalPages": 50
}
```

### GET /api/calls/[id]
Get call detail.

**Response:**
```json
{
  "call": {
    "id": "...",
    "direction": "inbound",
    "status": "completed",
    "fromPhone": "+61412345678",
    "toPhone": "+61400000000",
    "duration": 145,
    "summary": "Caller inquired about...",
    "transcript": [...],
    "recordingUrl": "https://...",
    "recordingExpiresAt": "2024-01-22T10:00:00Z",
    "smsSent": true,
    "smsSentAt": "2024-01-15T10:03:00Z",
    "startedAt": "2024-01-15T10:00:00Z",
    "endedAt": "2024-01-15T10:02:25Z"
  },
  "agent": {
    "id": "...",
    "name": "Lisa - Sales"
  },
  "contact": {
    "id": "...",
    "name": "John Smith",
    "phone": "+61412345678"
  }
}
```

### GET /api/calls/stats
Get call statistics for dashboard.

**Query Params:**
- `from` - Start date
- `to` - End date
- `agentId` - Filter by agent (optional)

**Response:**
```json
{
  "totalCalls": 150,
  "inboundCalls": 120,
  "outboundCalls": 30,
  "completedCalls": 140,
  "failedCalls": 10,
  "totalDuration": 18500,
  "averageDuration": 123,
  "smsSent": 135,
  "byDay": [
    { "date": "2024-01-15", "count": 25, "duration": 3200 },
    { "date": "2024-01-14", "count": 22, "duration": 2800 }
  ],
  "byAgent": [
    { "agentId": "...", "agentName": "Lisa", "count": 80 },
    { "agentId": "...", "agentName": "Tom", "count": 70 }
  ]
}
```

---

## Duration Formatting

```typescript
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (remainingSeconds === 0) {
    return `${minutes}m`;
  }

  return `${minutes}m ${remainingSeconds}s`;
}

// Examples:
// 45 → "45s"
// 60 → "1m"
// 145 → "2m 25s"
```

---

## Dashboard Stats Cards

The dashboard home page shows call statistics:

```tsx
function DashboardStats() {
  const { data } = useCallStats({ from: startOfWeek(), to: now() });

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <StatsCard
        title="Total Calls"
        value={data.totalCalls}
        subtitle="This week"
      />
      <StatsCard
        title="Avg Duration"
        value={formatDuration(data.averageDuration)}
        subtitle="Per call"
      />
      <StatsCard
        title="Inbound"
        value={data.inboundCalls}
        subtitle={`${Math.round(data.inboundCalls / data.totalCalls * 100)}%`}
      />
      <StatsCard
        title="SMS Sent"
        value={data.smsSent}
        subtitle="Follow-ups"
      />
    </div>
  );
}
```
