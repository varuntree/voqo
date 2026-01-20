# Voqo AI Integrations & Webhooks

## Integration Overview

Voqo AI offers two primary integration options for extending platform functionality:

1. **Webhook Integration** - Real-time event notifications via HTTP POST to external systems
2. **Knowledge Base Property Listings** - Automatic sync of property data from listing portals (REA, Domain.com.au)

Both integrations support two-way data flow: webhooks deliver outbound events, property listing integrations enable inbound data synchronization.

---

## Knowledge Base Integrations

### Supported Platforms

| Platform | Description |
|----------|-------------|
| **Realestate.com.au (REA)** | Syncs active property listings from agency accounts |
| **Domain.com.au** | Connects individual agent or entire agency profiles |
| **Google Calendar** | Availability checking and appointment scheduling |

### Auto-Sync Schedule

Property data automatically synchronizes **twice daily**:
- **12:00 PM AEDT**
- **6:00 PM AEDT**

Ensures listings remain current without manual intervention.

### What Gets Synced

Both REA and Domain sync comprehensive property information:

| Category | Fields |
|----------|--------|
| **Property Types** | Houses, apartments, units, townhouses, villas, land, commercial |
| **Details/Features** | Bedrooms, bathrooms, parking, land size |
| **Pricing** | Price and availability status |
| **Media** | Images, videos, virtual tours |
| **Agent Info** | Listing agent contact information |
| **Status** | Live, under offer, recently updated |

### Smart Transcription Enhancement (Keyterm Generation)

Automatically enhances speech recognition accuracy for property addresses:

- Extracts hard-to-pronounce suburb and street names from property addresses
- **400-token safe limit** for keyterm inclusion
- Manual keyterms receive **priority placement** before auto-generated terms

### Attaching Lists to Agents

1. Navigate to specific agent settings
2. Select lists through **Knowledge Base Lists** section
3. Found under **Conversation Settings**
4. Enables agents to reference property information during calls

### Field Visibility Controls

Administrators configure which information displays to agents across **8 categories**:

1. Basic info
2. Status
3. Location
4. Features
5. Pricing
6. Media
7. Agent details
8. Dates

Allows selective information sharing per list.

### Domain.com.au Connect Flow

1. Access Knowledge Base integrations in dashboard
2. Select Domain.com.au platform
3. Connect individual agent profile OR entire agency
4. Authorize access to listing data
5. Configure field visibility preferences
6. Data syncs automatically on schedule

---

## Webhook Integration

### Overview

Voqo sends real-time updates via **HTTP POST** requests containing **JSON payloads** about phone call interactions to your designated HTTPS endpoint.

### Developer Tools Configuration

1. Access **Developer Tools** in the dashboard footer
2. Create new webhook secret
3. Provide your **HTTPS endpoint URL** that will receive events
4. Save and copy your webhook secret for signature verification

### Authentication

#### Headers

| Header | Description |
|--------|-------------|
| `X-Webhook-Signature` | HMAC signature for payload verification |
| `X-Webhook-Timestamp` | Unix timestamp of request |

#### HMAC SHA-256 Signature Verification

**Algorithm:** HMAC-SHA256

**Verification Steps:**
1. Validate timestamp is within **5 minutes** of current time
2. Compute expected signature using webhook secret
3. Compare signatures using constant-time comparison

**Python/FastAPI Implementation:**

```python
import hmac
import hashlib
import time

WEBHOOK_SECRET = "your_webhook_secret"

def verify_webhook_signature(payload_body: str, signature: str, timestamp: str) -> bool:
    # Validate timestamp (within 5 minutes)
    current_time = int(time.time())
    request_time = int(timestamp)
    if abs(current_time - request_time) > 300:  # 5 minutes
        return False

    # Compute expected signature
    expected_signature = hmac.new(
        WEBHOOK_SECRET.encode('utf-8'),
        payload_body.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()

    # Constant-time comparison
    return hmac.compare_digest(expected_signature, signature)
```

**FastAPI Endpoint Example:**

```python
from fastapi import FastAPI, Request, HTTPException

app = FastAPI()

@app.post("/webhook")
async def receive_webhook(request: Request):
    signature = request.headers.get("X-Webhook-Signature")
    timestamp = request.headers.get("X-Webhook-Timestamp")
    payload_body = await request.body()

    if not verify_webhook_signature(payload_body.decode(), signature, timestamp):
        raise HTTPException(status_code=401, detail="Invalid signature")

    # Process webhook payload
    data = await request.json()
    # Handle event...

    return {"status": "ok"}
```

### Supported Events

| Event | Trigger |
|-------|---------|
| `call_ended` | Phone call completes |

### Retry Policy

| Parameter | Value |
|-----------|-------|
| **Total Retries** | 3 attempts |
| **Backoff Delay** | 5 seconds between retries |
| **Timeout** | 10 seconds per request |

### HTTP Response Codes

| Code | Meaning | Action |
|------|---------|--------|
| `200` | Success | None required |
| `4xx` | Client error | Fix integration issue |
| `5xx` | Server error | Automatic retry triggered |

### Complete Webhook Payload Schema

```json
{
  "_id": "string",
  "event_type": "call_ended",
  "timestamp": 1729762448,
  "data": {
    "id": "string",
    "agent_id": "string",
    "status": "completed|failed",
    "from_phone": "+61400000000",
    "to_phone": "+61400000001",
    "direction": "inbound|outbound",
    "call_summary": "string",
    "transcript": "string",
    "duration": 20,
    "error": null,
    "created_at": "2024-10-24T12:00:00.000Z",
    "start_time": "2024-10-24T12:00:00.000Z",
    "end_time": "2024-10-24T12:00:20.000Z",
    "recording_url": "https://storage.voqo.ai/recordings/...",
    "recording_url_expires_at": "2024-10-25T12:00:00.000Z",
    "post_call_action_results": [],
    "timestamps": [
      {
        "timestamp": 1744356337.9487917,
        "event_type": "message|action_start|action_end",
        "message_type": "bot|human",
        "text": "string"
      }
    ]
  }
}
```

### Payload Field Reference

#### Root Level

| Field | Type | Description |
|-------|------|-------------|
| `_id` | string | Unique webhook event identifier |
| `event_type` | string | Event type (e.g., `call_ended`) |
| `timestamp` | integer | Unix timestamp of event |
| `data` | object | Call data payload |

#### Data Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique call identifier |
| `agent_id` | string | Voqo AI agent identifier |
| `status` | string | Call status: `completed` or `failed` |
| `from_phone` | string | Caller phone number (E.164 format) |
| `to_phone` | string | Recipient phone number (E.164 format) |
| `direction` | string | Call direction: `inbound` or `outbound` |
| `call_summary` | string | AI-generated call summary |
| `transcript` | string | Full call transcript |
| `duration` | integer | Call duration in seconds |
| `error` | string/null | Error message if call failed |
| `created_at` | string | ISO 8601 timestamp - call record creation |
| `start_time` | string | ISO 8601 timestamp - call start |
| `end_time` | string | ISO 8601 timestamp - call end |
| `recording_url` | string | URL to call recording (signed, temporary) |
| `recording_url_expires_at` | string | ISO 8601 timestamp - recording URL expiry |
| `post_call_action_results` | array | Results from configured post-call actions |
| `timestamps` | array | Detailed event timeline during call |

#### Timestamps Array Items

| Field | Type | Description |
|-------|------|-------------|
| `timestamp` | float | Unix timestamp with microseconds |
| `event_type` | string | Type: `message`, `action_start`, `action_end` |
| `message_type` | string | Speaker: `bot` or `human` |
| `text` | string | Message content or action description |

---

## Support

- **Email:** support@voqo.ai
- **Phone:** +61 451 660 338
