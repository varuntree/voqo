# Telephony Specification

## Overview
Telephony is handled by ElevenLabs Conversational AI with native Twilio integration. Our app orchestrates but doesn't directly handle voice streams.

---

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Caller        │────▶│    Twilio       │────▶│  ElevenLabs     │
│                 │     │  (Phone Number) │     │  (Voice Agent)  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        │ Webhook
                                                        ▼
                                                ┌─────────────────┐
                                                │   Our App       │
                                                │  (Next.js API)  │
                                                └─────────────────┘
```

---

## Phone Number Setup

### Configuration (One-time)

1. **Existing Twilio Number**: Use pre-purchased Twilio number
2. **Import to ElevenLabs**: Import number via ElevenLabs dashboard or API
3. **Assign to Agent**: Link number to ElevenLabs agent

### Environment Variables

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+61400000000
```

The phone number is hardcoded and used for:
- Inbound calls (routed through ElevenLabs)
- Outbound calls (caller ID)
- SMS sending

---

## Inbound Call Flow

### Sequence

```
1. Caller dials TWILIO_PHONE_NUMBER
         │
         ▼
2. Twilio routes to ElevenLabs (native integration)
         │
         ▼
3. ElevenLabs matches to configured agent
         │
         ▼
4. Agent conversation begins
   - System prompt loaded
   - Contact lookup (via personalization webhook or stored context)
   - Memories injected if contact known
         │
         ▼
5. Conversation proceeds
   - Agent can trigger custom functions
   - Real-time transcription
         │
         ▼
6. Call ends
         │
         ▼
7. ElevenLabs sends webhook to our app
   - Event: post_call_transcription
   - Payload: transcript, summary, duration, etc.
         │
         ▼
8. Our app processes webhook
   - Store call record
   - Match/create contact
   - Extract and save memories
   - Send post-call SMS
```

---

## Outbound Call Flow

### Individual Outbound Call

**Trigger**: User clicks "Call" on a contact or enters a number

**API Endpoint**: `POST /api/outbound`

**Request:**
```json
{
  "agentId": "agent_abc123",
  "toPhone": "+61412345678",
  "contactId": "contact_xyz" // optional
}
```

**Process:**
```
1. Validate phone number (E.164 format)
         │
         ▼
2. Get agent's ElevenLabs agent ID
         │
         ▼
3. If contactId provided, fetch contact + memories
         │
         ▼
4. Call ElevenLabs API to initiate call
   POST /v1/convai/twilio/outbound-call
   {
     "agent_id": "el_agent_id",
     "agent_phone_number_id": "el_phone_id",
     "to_number": "+61412345678",
     "custom_llm_extra_body": {
       "caller_context": "Contact: John Smith\nMemories: ..."
     }
   }
         │
         ▼
5. ElevenLabs initiates call via Twilio
         │
         ▼
6. Conversation proceeds (same as inbound)
         │
         ▼
7. Post-call webhook received (same as inbound)
```

**Response:**
```json
{
  "success": true,
  "conversationId": "conv_abc123"
}
```

---

## ElevenLabs Webhook Integration

### Webhook Configuration

**Endpoint**: `POST /api/webhooks/elevenlabs`

**Events Subscribed**:
- `post_call_transcription` - Full transcript after call ends
- `call_initiation_failure` - Outbound call failed to connect

### Webhook Authentication

ElevenLabs signs webhooks with HMAC-SHA256.

**Headers:**
```
X-ElevenLabs-Signature: <hmac_signature>
X-ElevenLabs-Timestamp: <unix_timestamp>
```

**Verification:**
```typescript
import crypto from 'crypto';

function verifyWebhook(
  payload: string,
  signature: string,
  timestamp: string,
  secret: string
): boolean {
  const signedPayload = `${timestamp}.${payload}`;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(signedPayload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

### Webhook Payload: post_call_transcription

```json
{
  "event_type": "post_call_transcription",
  "conversation_id": "conv_abc123",
  "agent_id": "agent_xyz",
  "status": "completed",
  "call": {
    "from": "+61412345678",
    "to": "+61400000000",
    "direction": "inbound",
    "duration_seconds": 145,
    "started_at": "2024-01-15T10:00:00Z",
    "ended_at": "2024-01-15T10:02:25Z"
  },
  "transcript": [
    {
      "role": "agent",
      "message": "Hello! Thanks for calling Ray White Sydney...",
      "timestamp": 0.0
    },
    {
      "role": "user",
      "message": "Hi, I'm calling about the property on Beach Street",
      "timestamp": 3.5
    }
    // ... more turns
  ],
  "summary": "Caller inquired about 45 Beach St property. Interested in 3-bedroom properties in Bondi area with budget around $1.5M. Scheduled inspection for Saturday 2pm.",
  "analysis": {
    "sentiment": "positive",
    "outcome": "inspection_scheduled"
  },
  "recording": {
    "available": true,
    "url": "https://storage.elevenlabs.io/recordings/...",
    "expires_at": "2024-01-22T10:00:00Z"
  }
}
```

### Webhook Handler Logic

```typescript
// app/api/webhooks/elevenlabs/route.ts

export async function POST(request: Request) {
  // 1. Verify signature
  const signature = request.headers.get('X-ElevenLabs-Signature');
  const timestamp = request.headers.get('X-ElevenLabs-Timestamp');
  const body = await request.text();

  if (!verifyWebhook(body, signature, timestamp, process.env.ELEVENLABS_WEBHOOK_SECRET)) {
    return Response.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const payload = JSON.parse(body);

  // 2. Handle by event type
  switch (payload.event_type) {
    case 'post_call_transcription':
      await handleCallCompleted(payload);
      break;
    case 'call_initiation_failure':
      await handleCallFailed(payload);
      break;
  }

  return Response.json({ received: true });
}

async function handleCallCompleted(payload: PostCallPayload) {
  // 1. Find or create contact
  const callerPhone = payload.call.direction === 'inbound'
    ? payload.call.from
    : payload.call.to;

  let contact = await db.query.contacts.findFirst({
    where: eq(contacts.phone, callerPhone)
  });

  const autoCreate = await getSetting('auto_create_contacts');
  if (!contact && autoCreate) {
    contact = await db.insert(contacts).values({
      name: 'Unknown Caller',
      phone: callerPhone
    }).returning().get();
  }

  // 2. Store call record
  const call = await db.insert(calls).values({
    agentId: getAgentIdFromElevenLabs(payload.agent_id),
    contactId: contact?.id,
    elevenlabsConversationId: payload.conversation_id,
    direction: payload.call.direction,
    status: payload.status,
    fromPhone: payload.call.from,
    toPhone: payload.call.to,
    summary: payload.summary,
    transcript: JSON.stringify(payload.transcript),
    duration: payload.call.duration_seconds,
    recordingUrl: payload.recording?.url,
    recordingExpiresAt: payload.recording?.expires_at,
    startedAt: payload.call.started_at,
    endedAt: payload.call.ended_at
  }).returning().get();

  // 3. Extract and save memories
  if (contact) {
    const saveMemories = await getSetting('save_memories');
    if (saveMemories) {
      await extractAndSaveMemories(contact.id, call.id, payload);
    }
  }

  // 4. Send post-call SMS
  const smsEnabled = await getSetting('sms_enabled');
  const skipSilent = await getSetting('sms_skip_silent');
  const hasHumanSpeech = payload.transcript.some(t => t.role === 'user');

  if (smsEnabled && (!skipSilent || hasHumanSpeech)) {
    await sendPostCallSMS(call, contact, payload);
  }
}
```

---

## Outbound Call API

### Endpoint: POST /api/outbound

**Request:**
```json
{
  "agentId": "local_agent_id",
  "toPhone": "+61412345678",
  "contactId": "local_contact_id",  // optional
  "variables": {                     // optional, for batch calls
    "property_address": "45 Beach St"
  }
}
```

**Response (Success):**
```json
{
  "success": true,
  "conversationId": "conv_abc123",
  "callId": "local_call_id"
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Invalid phone number format"
}
```

### Implementation

```typescript
// app/api/outbound/route.ts

export async function POST(request: Request) {
  const { agentId, toPhone, contactId, variables } = await request.json();

  // 1. Validate phone
  if (!isValidE164(toPhone)) {
    return Response.json({ success: false, error: 'Invalid phone number' }, { status: 400 });
  }

  // 2. Get agent
  const agent = await db.query.agents.findFirst({
    where: eq(agents.id, agentId)
  });

  if (!agent || !agent.elevenlabsAgentId) {
    return Response.json({ success: false, error: 'Agent not found' }, { status: 404 });
  }

  // 3. Build context
  let context = '';
  if (contactId) {
    const contact = await db.query.contacts.findFirst({
      where: eq(contacts.id, contactId),
      with: { memories: true }
    });
    if (contact) {
      context = buildCallerContext(contact);
    }
  }

  // 4. Call ElevenLabs
  const response = await fetch('https://api.elevenlabs.io/v1/convai/twilio/outbound-call', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.ELEVENLABS_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      agent_id: agent.elevenlabsAgentId,
      agent_phone_number_id: process.env.ELEVENLABS_PHONE_NUMBER_ID,
      to_number: toPhone,
      custom_llm_extra_body: {
        caller_context: context,
        ...variables
      }
    })
  });

  if (!response.ok) {
    const error = await response.json();
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }

  const data = await response.json();

  // 5. Create pending call record
  const call = await db.insert(calls).values({
    agentId,
    contactId,
    elevenlabsConversationId: data.conversation_id,
    direction: 'outbound',
    status: 'initiated',
    fromPhone: process.env.TWILIO_PHONE_NUMBER,
    toPhone
  }).returning().get();

  return Response.json({
    success: true,
    conversationId: data.conversation_id,
    callId: call.id
  });
}
```

---

## Phone Number Validation

```typescript
// lib/utils.ts

export function isValidE164(phone: string): boolean {
  // E.164: + followed by 1-15 digits
  return /^\+[1-9]\d{1,14}$/.test(phone);
}

export function formatPhoneE164(phone: string, defaultCountry = 'AU'): string | null {
  // Remove all non-digit characters except +
  let cleaned = phone.replace(/[^\d+]/g, '');

  // If starts with 0, assume Australian number
  if (cleaned.startsWith('0') && defaultCountry === 'AU') {
    cleaned = '+61' + cleaned.slice(1);
  }

  // If no +, add default country code
  if (!cleaned.startsWith('+')) {
    if (defaultCountry === 'AU') {
      cleaned = '+61' + cleaned;
    } else if (defaultCountry === 'US') {
      cleaned = '+1' + cleaned;
    }
  }

  return isValidE164(cleaned) ? cleaned : null;
}
```

---

## ElevenLabs API Client

```typescript
// lib/elevenlabs/client.ts

const BASE_URL = 'https://api.elevenlabs.io/v1';

export class ElevenLabsClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async request(path: string, options: RequestInit = {}) {
    const response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'ElevenLabs API error');
    }

    return response.json();
  }

  // Agents
  async createAgent(config: CreateAgentConfig) {
    return this.request('/convai/agents', {
      method: 'POST',
      body: JSON.stringify(config)
    });
  }

  async updateAgent(agentId: string, config: UpdateAgentConfig) {
    return this.request(`/convai/agents/${agentId}`, {
      method: 'PATCH',
      body: JSON.stringify(config)
    });
  }

  async deleteAgent(agentId: string) {
    return this.request(`/convai/agents/${agentId}`, {
      method: 'DELETE'
    });
  }

  // Calls
  async startOutboundCall(config: OutboundCallConfig) {
    return this.request('/convai/twilio/outbound-call', {
      method: 'POST',
      body: JSON.stringify(config)
    });
  }

  // Conversations
  async getConversation(conversationId: string) {
    return this.request(`/convai/conversations/${conversationId}`);
  }

  async listConversations(params?: ListConversationsParams) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/convai/conversations?${query}`);
  }
}

export const elevenlabs = new ElevenLabsClient(process.env.ELEVENLABS_API_KEY!);
```

---

## Error Handling

| Error | Handling |
|-------|----------|
| Webhook signature invalid | Return 401, log attempt |
| ElevenLabs API error | Return error to client, log details |
| Phone number invalid | Return 400 with message |
| Agent not found | Return 404 |
| Outbound call fails | Create call record with 'failed' status |
| Duplicate conversation ID | Skip processing (idempotency) |
