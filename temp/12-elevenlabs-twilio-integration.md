# ElevenLabs Conversational AI + Twilio Integration

## Overview

ElevenLabs native Twilio integration enables AI-driven phone calls without changing existing infrastructure. Supports both inbound and outbound calls.

**Key Features:**
- Sub-second response times
- Auto webhook config (no manual TwiML)
- Enterprise-grade reliability
- 24/7 intelligent call answering

---

## 1. Setup Process

### Prerequisites
- Paid Twilio account
- Active Twilio phone number
- ElevenLabs account with agent access

### Step 1: Import Twilio Number

1. Navigate to **ElevenLabs Dashboard > Telephony > Phone Numbers**
2. Click **+ Import number** > **From Twilio**
3. Enter:
   - Phone number (E.164 format)
   - Twilio Account SID
   - Twilio Auth Token
   - Label (optional)

ElevenLabs auto-configures Twilio webhooks.

### Step 2: Assign Agent

1. Click imported number
2. Select agent from dropdown
3. Connection active immediately

### Phone Number Types

| Type | Inbound | Outbound | Notes |
|------|---------|----------|-------|
| Purchased Twilio Number | Yes | Yes | Full capabilities |
| Verified Caller ID | No | Yes | Outbound only, can't assign agent |

### API: Import Phone Number

```
POST https://api.elevenlabs.io/v1/convai/phone-numbers
```

**Headers:**
```
xi-api-key: your-api-key
Content-Type: application/json
```

**Twilio Config Body:**
```json
{
  "phone_number": "+15551234567",
  "label": "Main Line",
  "sid": "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "token": "your-auth-token",
  "supports_inbound": true,
  "supports_outbound": true
}
```

**Response:**
```json
{
  "phone_number_id": "phn_xxxxxxxx"
}
```

---

## 2. Inbound Call Flow

### Native Integration (Recommended)
1. Caller dials Twilio number
2. Twilio triggers webhook to ElevenLabs (auto-configured)
3. ElevenLabs routes to assigned agent
4. Agent handles conversation
5. Post-call webhook sent (if configured)

### Custom Infrastructure (Register Call)

For full control over Twilio workflows.

**When to use:**
- Existing Twilio infrastructure
- Complex routing logic before agent
- Custom call flows

**Endpoint:**
```
POST https://api.elevenlabs.io/v1/convai/twilio/register-call
```

**Flow:**
1. Your server receives Twilio call
2. Call ElevenLabs register endpoint
3. ElevenLabs returns TwiML
4. Return TwiML to Twilio
5. WebSocket connection established

**Python Example (FastAPI):**
```python
from fastapi import FastAPI, Request
from fastapi.responses import Response
from elevenlabs.client import ElevenLabs

app = FastAPI()
client = ElevenLabs(api_key="your-api-key")

@app.post("/inbound")
async def handle_inbound(request: Request):
    form = await request.form()
    from_number = form.get("From")
    to_number = form.get("To")

    response = client.conversational_ai.twilio.register_call(
        agent_id="your-agent-id",
        from_number=from_number,
        to_number=to_number,
        direction="inbound"
    )

    return Response(content=response.twiml, media_type="application/xml")
```

**TypeScript Example (Express):**
```typescript
import express from 'express';
import { ElevenLabsClient } from 'elevenlabs';

const app = express();
const client = new ElevenLabsClient({ apiKey: 'your-api-key' });

app.post('/inbound', async (req, res) => {
  const { From, To } = req.body;

  const response = await client.conversationalAi.twilio.registerCall({
    agentId: 'your-agent-id',
    fromNumber: From,
    toNumber: To,
    direction: 'inbound'
  });

  res.type('application/xml').send(response.twiml);
});
```

**Limitations of Register Call:**
- No call transfers (ElevenLabs lacks Twilio credentials)
- Manual audio format config required (μ-law 8000 Hz)
- Numbers don't appear in ElevenLabs dashboard

---

## 3. Outbound Call Flow

### Via Dashboard
1. Go to **Phone Numbers** tab
2. Click **Outbound call** button
3. Select agent
4. Enter recipient number
5. Click **Send Test Call**

### Via API

**Endpoint:**
```
POST https://api.elevenlabs.io/v1/convai/twilio/outbound-call
```

**Headers:**
```
xi-api-key: your-api-key
Content-Type: application/json
```

**Required Parameters:**
| Field | Type | Description |
|-------|------|-------------|
| `agent_id` | string | Agent identifier |
| `agent_phone_number_id` | string | Imported phone number ID |
| `to_number` | string | Recipient (E.164 format) |

**Optional Parameters:**
| Field | Type | Description |
|-------|------|-------------|
| `conversation_initiation_client_data` | object | Dynamic vars, overrides |
| `conversation_config_override` | object | Audio/text settings |
| `user_id` | string | End user tracking ID |
| `dynamic_variables` | object | Custom prompt variables |

**Request Example:**
```json
{
  "agent_id": "agent_xxxxxxxx",
  "agent_phone_number_id": "phn_xxxxxxxx",
  "to_number": "+15559876543",
  "conversation_initiation_client_data": {
    "dynamic_variables": {
      "customer_name": "John Doe",
      "account_id": "12345"
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Call initiated",
  "conversation_id": "conv_xxxxxxxx",
  "callSid": "CAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
}
```

---

## 4. Phone Number Management

### Where Numbers Live
- **Twilio manages**: Number provisioning, porting, billing
- **ElevenLabs manages**: Agent assignment, call routing, webhooks

### Import Options

1. **Native Twilio Import** - Dashboard or API, auto webhook config
2. **SIP Trunking** - Bring your own carrier
3. **Verified Caller IDs** - Outbound only

### SIP Trunk Import

```
POST https://api.elevenlabs.io/v1/convai/phone-numbers
```

```json
{
  "phone_number": "+15551234567",
  "label": "SIP Line",
  "supports_inbound": true,
  "supports_outbound": true,
  "inbound_trunk_config": {
    "allowed_addresses": ["sip.carrier.com"],
    "media_encryption": "required"
  },
  "outbound_trunk_config": {
    "address": "sip.carrier.com",
    "transport": "tls"
  }
}
```

---

## 5. Call Forwarding Setup

### Forward Existing Numbers to Agent

**Option A: Native Import**
Import number directly to ElevenLabs. Twilio webhook auto-configured.

**Option B: Twilio Forwarding to Custom Server**

1. Set Twilio webhook URL to your server
2. Server calls ElevenLabs register endpoint
3. Return TwiML to Twilio

**Twilio Console Config:**
1. Go to Phone Numbers > Manage > Active Numbers
2. Select number
3. Under "A call comes in" select Webhook
4. Enter your server URL
5. Save

**TwiML for Simple Forward:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial>+15551234567</Dial>
</Response>
```

### Missed Call Handling

ElevenLabs doesn't natively handle voicemail. Options:

1. **Configure in Twilio**: Use Twilio Studio or TwiML for fallback
2. **Call Initiation Failure Webhook**: Get notified of failed calls

---

## 6. Webhooks

### Types

| Type | Trigger | Contains |
|------|---------|----------|
| `post_call_transcription` | Call ends + analysis complete | Full transcript, analysis, metadata |
| `post_call_audio` | Call ends | Base64 MP3 audio only |
| `call_initiation_failure` | Call fails to connect | Failure reason, metadata |

### Configuration

1. Go to **ElevenLabs > Settings > Webhooks**
2. Enter endpoint URL (HTTPS required)
3. Set authentication secret
4. Enable desired webhook types

### Post-Call Transcription Payload

```json
{
  "type": "post_call_transcription",
  "event_timestamp": 1705123456,
  "data": {
    "agent_id": "agent_xxx",
    "conversation_id": "conv_xxx",
    "status": "done",
    "user_id": "user_123",
    "transcript": [
      {
        "role": "agent",
        "message": "Hello, how can I help?",
        "time_in_call_secs": 0.5
      },
      {
        "role": "user",
        "message": "I need to check my order status",
        "time_in_call_secs": 2.1
      }
    ],
    "metadata": {
      "start_time_unix_secs": 1705123400,
      "call_duration_secs": 120,
      "cost": 0.15,
      "phone_call": {
        "direction": "inbound",
        "from_number": "+15551234567",
        "to_number": "+15559876543",
        "call_sid": "CAxxxxxxxx"
      },
      "termination_reason": "agent_ended"
    },
    "analysis": {
      "evaluation_criteria_results": {...},
      "data_collection_results": {...},
      "call_successful": "success",
      "transcript_summary": "Customer inquired about order #12345..."
    },
    "has_audio": true,
    "has_user_audio": true,
    "has_response_audio": true
  }
}
```

### Post-Call Audio Payload

```json
{
  "type": "post_call_audio",
  "event_timestamp": 1705123456,
  "data": {
    "agent_id": "agent_xxx",
    "conversation_id": "conv_xxx",
    "full_audio": "base64-encoded-mp3-data..."
  }
}
```

### Call Initiation Failure Payload

```json
{
  "type": "call_initiation_failure",
  "event_timestamp": 1705123456,
  "data": {
    "agent_id": "agent_xxx",
    "conversation_id": "conv_xxx",
    "failure_reason": "no-answer",
    "metadata": {
      "provider": "twilio",
      "call_sid": "CAxxxxxxxx",
      "from_number": "+15551234567",
      "to_number": "+15559876543"
    }
  }
}
```

**Failure Reasons:** `busy`, `no-answer`, `unknown`

### HMAC Authentication

**Header:** `ElevenLabs-Signature`
**Format:** `t=timestamp,v0=hash`

**Validation Steps:**
1. Extract timestamp and signature from header
2. Check timestamp < 30 minutes old
3. Compute SHA256 HMAC of `{timestamp}.{body}` with secret
4. Compare hash

**Python Validation:**
```python
import hmac
import time
from hashlib import sha256

def validate_webhook(request, secret):
    sig_header = request.headers.get("elevenlabs-signature")
    parts = dict(p.split("=", 1) for p in sig_header.split(","))

    timestamp = parts["t"]
    signature = parts["v0"]

    # Check freshness
    if int(timestamp) < int(time.time()) - 1800:
        return False

    # Verify signature
    payload = f"{timestamp}.{request.body.decode()}"
    expected = hmac.new(
        secret.encode(),
        payload.encode(),
        sha256
    ).hexdigest()

    return hmac.compare_digest(signature, expected)
```

### IP Whitelisting

**Default Regions:**
- US: `34.67.146.145`, `34.59.11.47`
- EU: `35.204.38.71`, `34.147.113.54`
- Asia: `35.185.187.110`, `35.247.157.189`

### Reliability

- Must return HTTP 200
- Auto-disabled after 10 consecutive failures over 7+ days
- HIPAA: No retries on failure

---

## 7. Post-Call Data

### Get Conversation Details

```
GET https://api.elevenlabs.io/v1/convai/conversations/{conversation_id}
```

**Response Fields:**

| Field | Description |
|-------|-------------|
| `conversation_id` | Unique ID |
| `agent_id` | Agent that handled call |
| `status` | `initiated`, `in-progress`, `processing`, `done`, `failed` |
| `transcript` | Array of turns with role, message, timestamp |
| `metadata` | Timing, cost, phone details |
| `analysis` | Evaluation results, summary |
| `has_audio` | Audio available |
| `has_user_audio` | User audio available |
| `has_response_audio` | Agent audio available |

### Transcript Structure

```json
{
  "transcript": [
    {
      "role": "agent",
      "message": "Hello, how can I help?",
      "time_in_call_secs": 0.5,
      "tool_calls": [],
      "interrupted": false
    },
    {
      "role": "user",
      "message": "Check my order",
      "time_in_call_secs": 2.1,
      "feedback": null
    }
  ]
}
```

### List Conversations

```
GET https://api.elevenlabs.io/v1/convai/conversations
```

**Query Parameters:**

| Param | Description |
|-------|-------------|
| `agent_id` | Filter by agent |
| `page_size` | Results per page (max 100, default 30) |
| `cursor` | Pagination token |
| `call_start_before_unix` | Filter by date range |
| `call_start_after_unix` | Filter by date range |
| `call_duration_min_secs` | Min duration filter |
| `call_duration_max_secs` | Max duration filter |
| `call_successful` | `success`, `failure`, `unknown` |
| `search` | Fuzzy transcript search |
| `summary_mode` | Include summaries |

### Analysis Features

**Success Evaluation:**
- Define custom criteria
- Assess goal achievement
- Track satisfaction

**Data Collection:**
- Extract structured info from transcript
- Contact details, issue types, etc.

Configure in agent settings under **Analysis** tab.

---

## 8. Dynamic Variables & Personalization

### System Variables (Auto-Available)

| Variable | Description |
|----------|-------------|
| `{{system__caller_id}}` | Caller phone number |
| `{{system__called_number}}` | Your Twilio number |
| `{{system__call_sid}}` | Twilio call SID |
| `{{system__conversation_id}}` | ElevenLabs conv ID |
| `{{system__call_duration_secs}}` | Duration |
| `{{system__time_utc}}` | Current UTC time |

### Custom Variables

Pass at call initiation:

```json
{
  "conversation_initiation_client_data": {
    "dynamic_variables": {
      "customer_name": "John",
      "account_status": "premium",
      "order_id": "12345"
    }
  }
}
```

Use in prompts: `Hello {{customer_name}}, I see you're a {{account_status}} member.`

### Secret Variables

Prefix with `secret__` for sensitive data (never sent to LLM):

```json
{
  "dynamic_variables": {
    "secret__api_token": "sk-xxx"
  }
}
```

### Twilio Personalization Webhook

Fetch caller context dynamically.

**Setup:**
1. Configure webhook URL in ElevenLabs settings
2. Enable in agent Security tab

**Incoming Request (from ElevenLabs):**
```json
{
  "caller_id": "+15551234567",
  "agent_id": "agent_xxx",
  "called_number": "+15559876543",
  "call_sid": "CAxxxxxxxx"
}
```

**Your Response:**
```json
{
  "dynamic_variables": {
    "customer_name": "John Doe",
    "account_type": "premium"
  },
  "conversation_config_override": {
    "agent": {
      "prompt": {
        "prompt": "Custom prompt for this caller..."
      },
      "first_message": "Hi John! How can I help?"
    }
  }
}
```

---

## Environment Variables Template

```env
# ElevenLabs
ELEVENLABS_API_KEY=your-api-key
ELEVENLABS_AGENT_ID=your-agent-id

# Twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxx
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+15551234567

# Webhook
WEBHOOK_SECRET=your-hmac-secret
```

---

## Quick Reference

### Endpoints

| Action | Endpoint |
|--------|----------|
| Import number | `POST /v1/convai/phone-numbers` |
| Outbound call | `POST /v1/convai/twilio/outbound-call` |
| Register call | `POST /v1/convai/twilio/register-call` |
| Get conversation | `GET /v1/convai/conversations/{id}` |
| List conversations | `GET /v1/convai/conversations` |

Base URL: `https://api.elevenlabs.io`

### SDK Support

Python, TypeScript/JS, Go, Ruby, Java, PHP, C#, Swift

---

## Sources

- [ElevenLabs Twilio Integration](https://elevenlabs.io/agents/integrations/twilio)
- [Native Integration Docs](https://elevenlabs.io/docs/agents-platform/phone-numbers/twilio-integration/native-integration)
- [Register Call Docs](https://elevenlabs.io/docs/agents-platform/phone-numbers/twilio-integration/register-call)
- [Outbound Call API](https://elevenlabs.io/docs/api-reference/twilio/outbound-call)
- [Post-Call Webhooks](https://elevenlabs.io/docs/agents-platform/workflows/post-call-webhooks)
- [Conversation API](https://elevenlabs.io/docs/agents-platform/api-reference/conversations/get)
- [Dynamic Variables](https://elevenlabs.io/docs/agents-platform/customization/personalization/dynamic-variables)
- [Twilio Personalization](https://elevenlabs.io/docs/agents-platform/customization/personalization/twilio-personalization)
- [GitHub: elevenlabs-twilio-i-o](https://github.com/louisjoecodes/elevenlabs-twilio-i-o)
