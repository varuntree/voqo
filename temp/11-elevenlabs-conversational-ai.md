# ElevenLabs Conversational AI - Research Summary

## 1. Overview & Capabilities

### What is ElevenLabs Conversational AI?

ElevenLabs Conversational AI (now called "Agents Platform") is a platform for building and deploying real-time voice and chat agents. It enables creation of AI agents that accomplish tasks through natural dialogue - from quick requests to complex, open-ended workflows.

**Key highlights:**
- Sub-100ms latency for real-time conversations
- 32+ languages supported
- 5,000+ voices available
- Enterprise-grade security

### Core Capabilities

| Capability | Description |
|------------|-------------|
| Natural Turn-Taking | Proprietary model handles conversation timing, avoiding awkward pauses or interruptions |
| Multilingual Support | Automatic language detection; agent responds in detected language |
| Integrated RAG | Retrieval-Augmented Generation built into voice agent architecture |
| Multimodality | Process both spoken language and typed text concurrently |
| Low Latency | Sub-second response times critical for voice applications |

### What Can You Build?

- Customer support agents
- Sales and lead qualification bots
- Technical support assistants
- Appointment scheduling systems
- Interactive voice response (IVR) replacements
- Language tutoring with native speaker voices
- Multi-character storytelling experiences

---

## 2. Architecture

### What ElevenLabs Handles vs What You Build

**ElevenLabs provides:**
- Speech-to-Text (ASR) - fine-tuned for conversation
- Text-to-Speech (TTS) - low-latency, 5k+ voices, 31 languages
- Turn-taking conversation mechanics
- Dashboard and visual workflow builder
- Monitoring, testing, and analytics tools
- Pre-built UI components and SDKs
- WebSocket and WebRTC infrastructure

**You configure/build:**
- System prompts and conversation workflows
- Knowledge bases (documents, FAQs)
- Tool/API connections (webhooks, external services)
- Authentication logic
- Deployment channels (web, mobile, telephony)
- Custom LLM selection (optional)

### Architecture Diagram (Conceptual)

```
┌─────────────────────────────────────────────────────────────────┐
│                         Your Application                         │
├─────────────────────────────────────────────────────────────────┤
│  SDK/WebSocket  │  Phone (Twilio)  │  Web Widget  │  Mobile App │
└────────┬────────┴────────┬─────────┴──────┬───────┴──────┬──────┘
         │                 │                │              │
         ▼                 ▼                ▼              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ElevenLabs Agents Platform                    │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────────┐  │
│  │   ASR    │  │   LLM    │  │   TTS    │  │  Turn-Taking    │  │
│  │ (Scribe) │  │ (Choice) │  │  (Flash) │  │    Model        │  │
│  └──────────┘  └──────────┘  └──────────┘  └─────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│  Knowledge Base (RAG)  │  Tools (Webhooks)  │  Native Integrations │
└─────────────────────────────────────────────────────────────────┘
         │                        │
         ▼                        ▼
┌─────────────────┐    ┌─────────────────────────┐
│  Your Documents │    │  Your APIs/Services     │
│  (PDFs, URLs)   │    │  (CRM, DB, Calendars)   │
└─────────────────┘    └─────────────────────────┘
```

---

## 3. Twilio Integration for Phone Calls

### Integration Options

#### Option A: Native Integration (Recommended for simplicity)

ElevenLabs manages Twilio configuration automatically.

**Setup:**
1. Navigate to Phone Numbers tab in Agents Platform
2. Enter: label, phone number, Twilio Account SID, Auth Token
3. ElevenLabs auto-configures Twilio webhooks
4. Assign an agent to handle inbound calls

**Capabilities:**
- **Purchased Twilio Numbers**: Inbound + Outbound calls
- **Verified Caller IDs**: Outbound only

**Pros:** Simple setup, automatic webhook config
**Cons:** Less control, no call transfers

#### Option B: Register Call (For custom Twilio logic)

You maintain your Twilio infrastructure; ElevenLabs handles conversation.

**Flow:**
1. Twilio receives call
2. Your server calls ElevenLabs `/v1/convai/twilio/register-call`
3. ElevenLabs returns TwiML
4. You return TwiML to Twilio

**API Endpoint:**
```
POST https://api.elevenlabs.io/v1/convai/twilio/register-call
```

**Parameters:**
- `agent_id` (required): Agent handling the call
- `from_number` (required): Caller's phone number
- `to_number` (required): Destination number
- `direction` (optional): "inbound" or "outbound"
- `conversation_initiation_client_data` (optional): Dynamic variables

**Pros:** Full Twilio control, custom routing logic
**Cons:** More complex, no call transfers, manual config

### Technical Requirements

- Audio format: **μ-law 8000 Hz** (telephony standard)
- Configure in agent's Voice settings AND Advanced section

### Outbound Calls API

```
POST https://api.elevenlabs.io/v1/convai/twilio/outbound-call
```

**Request Body:**
```json
{
  "agent_id": "agent_12345",
  "agent_phone_number_id": "phone_67890",
  "to_number": "+14155552671",
  "conversation_initiation_client_data": {
    "dynamic_variables": {
      "customer_name": "John"
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Call initiated",
  "conversation_id": "conv_abc123",
  "callSid": "CA..."
}
```

### Batch Calling

For mass outbound calls (notifications, surveys, campaigns):
- Initiate multiple calls simultaneously
- Programmatic API integration
- Progress tracking

---

## 4. Agent Configuration Options

### Voice Settings

**Voice Selection:**
- 11+ pre-built voices with distinct characteristics
- Custom voice creation via Voice Design
- Multi-voice support (switch voices mid-conversation)

**Key Parameters:**

| Setting | Range | Description |
|---------|-------|-------------|
| Stability | 0.0-1.0 | Higher = consistent but potentially monotonous. Lower = more emotional variation. Sweet spot: 0.60-0.85 |
| Similarity | 0.0-1.0 | How closely to match original voice. Higher = clearer but may distort. Sweet spot: 0.75 |
| Speed | 0.9-1.1x | Natural conversation range |

**Model Selection for Voice:**
- `eleven_flash_v2_5`: Optimized for real-time (75ms latency)
- English-only models: More stable for English content

### System Prompt

The system prompt defines agent personality, goals, tools, instructions, and guardrails.

**Best Practices:**
1. **Separate into sections** using markdown headings (`# Guardrails`, `# Instructions`)
2. **Be concise** - every unnecessary word is potential misinterpretation
3. **Emphasize critical steps** - add "This step is important"
4. **Normalize I/O** - separate spoken format from written format
5. **Provide examples** for complex formatting
6. **Dedicate guardrails section** - models prioritize `# Guardrails` heading

**Example Structure:**
```markdown
# Identity
You are Sarah, a customer support agent for Acme Corp.

# Goals
- Help customers resolve issues quickly
- Collect feedback when appropriate

# Instructions
1. Greet the customer warmly
2. Verify their identity by asking for order number
3. Look up their order using the get_order tool. This step is important.
4. Resolve their issue or escalate appropriately

# Guardrails
- Never provide refunds over $500 without manager approval
- Never share internal policies
- If unsure, offer to transfer to human agent
```

### First Message

The first message the agent speaks when conversation starts. Keep it welcoming and clear.

### LLM Selection

**Hosted Options (ultra-low latency):**
- ElevenLabs hosted LLMs

**Third-Party Models:**
- GPT-4o / GPT-4o mini
- Claude Sonnet 4 / Claude 3.5 Sonnet
- Gemini 2.5 Flash / Flash Lite

**Custom LLM:**
- Connect your own via server integration

**Selection Guidelines:**
- **GPT-4o / Claude Sonnet**: Complex reasoning, multi-step tasks
- **Gemini Flash Lite**: Ultra-low latency, simple high-frequency interactions

### Knowledge Base (RAG)

**Adding Documents:**
- Upload PDFs, text files
- Add URLs
- Max 20MB / 300k chars (non-enterprise)

**How RAG Works:**
- Small knowledge bases: Direct context injection
- Large knowledge bases: Automatic RAG retrieval (~500ms latency)

**Indexing:**
- Automatic when document added
- Check status in knowledge base list
- Cannot enable RAG for docs <500 bytes

---

## 5. Tools / Functions

### Tool Types

#### Server Tools (Webhooks)
Connect to external APIs for real-time data and actions.

**Use Cases:**
- Fetch customer data from CRM
- Check inventory
- Process orders/returns
- Schedule appointments
- Send notifications

**Configuration:**
- Name & description (helps LLM decide when to use)
- HTTP method (GET, POST, etc.)
- URL endpoint
- Parameters: path, query, body, dynamic variables

**Authentication Options:**
- OAuth2 (Client Credentials, JWT)
- Basic Auth
- Bearer Token
- Custom Headers

**Example: Weather Tool**
```json
{
  "name": "get_weather",
  "description": "Get current weather for a location",
  "method": "GET",
  "url": "https://api.open-meteo.com/v1/forecast",
  "parameters": {
    "query": {
      "latitude": { "type": "number", "required": true },
      "longitude": { "type": "number", "required": true }
    }
  }
}
```

#### Client Tools
Execute functions on user's browser/device.

**Use Cases:**
- Trigger UI alerts/modals
- Update DOM elements
- Log messages
- Guide users through interfaces

**Implementation:**
1. Configure in agent dashboard (Tool Type: "Client")
2. Register handler in your app via SDK
3. Enable "Wait for response" if returning data to agent

#### System Tools
Built-in tools provided by ElevenLabs (e.g., end conversation, transfer).

### Native Integrations (No-Code)

Pre-built connections to popular services:
- **CRM**: Salesforce, HubSpot
- **Support**: Zendesk, ServiceNow
- **Payments**: Stripe
- **Telephony**: Twilio
- **Custom**: Any REST API

**Capabilities:**
- Fetch data
- Trigger workflows
- Send updates
- Log events

### MCP Support

Built-in support for Model Context Protocol (MCP) - connect to Gmail, Zapier, and more.

---

## 6. Webhooks & Callbacks

### Post-Call Webhooks

Three webhook types sent after call completion:

#### 1. Transcription Webhook (`post_call_transcription`)

Full conversation data after analysis.

**Payload includes:**
```json
{
  "type": "post_call_transcription",
  "data": {
    "agent_id": "...",
    "conversation_id": "...",
    "transcript": [
      {
        "role": "user",
        "message": "I need help with my order",
        "time_in_call_secs": 2.5,
        "tool_calls": [],
        "tool_results": []
      },
      {
        "role": "agent",
        "message": "I'd be happy to help...",
        "time_in_call_secs": 4.2
      }
    ],
    "metadata": {
      "call_duration_secs": 120,
      "start_time_unix_secs": 1704067200,
      "cost": 0.20
    },
    "analysis": {
      "evaluation_results": {},
      "data_collection_results": {}
    }
  }
}
```

#### 2. Audio Webhook (`post_call_audio`)

Minimal data with base64-encoded MP3 audio.

**Payload:**
```json
{
  "type": "post_call_audio",
  "data": {
    "agent_id": "...",
    "conversation_id": "...",
    "audio": "base64_encoded_mp3_data..."
  }
}
```

**Note:** Delivered as chunked HTTP (large files).

#### 3. Call Initiation Failure (`call_initiation_failure`)

Information about failed call attempts.

**Failure reasons:**
- `busy`
- `no-answer`
- `unknown`

**Payload includes provider metadata** (Twilio vs SIP).

### Webhook Configuration

1. Create webhook in Settings page
2. Enable in agent's workflow settings
3. Select events to listen for

### Authentication

**HMAC-SHA256 signature validation:**

Header format: `ElevenLabs-Signature: t=timestamp,v0=hash`

Verify: `SHA256_HMAC(timestamp.request_body, secret)`

### Egress IPs (for whitelisting)

Static IPs provided across regions (US, EU, Asia).

### Best Practices

- Return HTTP 200 quickly
- Process async if needed
- Auto-disabled after 10+ consecutive failures (7+ days)

---

## 7. API Reference

### Authentication

All API calls require header:
```
xi-api-key: your_api_key_here
```

### Core Endpoints

#### List Conversations

```
GET https://api.elevenlabs.io/v1/convai/conversations
```

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `cursor` | string | Pagination cursor |
| `agent_id` | string | Filter by agent |
| `page_size` | int | Max 100, default 30 |
| `call_start_before_unix` | int | Upper date bound |
| `call_start_after_unix` | int | Lower date bound |
| `call_duration_min_secs` | int | Min duration filter |
| `call_duration_max_secs` | int | Max duration filter |
| `call_successful` | enum | success/failure/unknown |
| `rating_min` / `rating_max` | int | 1-5 rating filter |
| `search` | string | Full-text transcript search |
| `summary_mode` | enum | include/exclude |

**Response:**
```json
{
  "conversations": [
    {
      "agent_id": "...",
      "conversation_id": "...",
      "start_time_unix_secs": 1704067200,
      "call_duration_secs": 120,
      "message_count": 15,
      "status": "done",
      "call_successful": "success",
      "rating": 5,
      "transcript_summary": "Customer inquired about...",
      "direction": "inbound"
    }
  ],
  "next_cursor": "...",
  "has_more": true
}
```

#### Get Conversation Details

```
GET https://api.elevenlabs.io/v1/convai/conversations/{conversation_id}
```

**Response includes:**
- Full transcript with timestamps
- Tool calls and results
- Metadata (duration, costs)
- Analysis results
- Audio availability flags

#### Outbound Call (Twilio)

```
POST https://api.elevenlabs.io/v1/convai/twilio/outbound-call
```

**Request:**
```json
{
  "agent_id": "agent_123",
  "agent_phone_number_id": "phone_456",
  "to_number": "+14155552671",
  "conversation_initiation_client_data": {
    "dynamic_variables": {
      "customer_name": "John Doe"
    }
  }
}
```

#### Outbound Call (SIP)

```
POST https://api.elevenlabs.io/v1/convai/sip-trunk/outbound-call
```

Same parameters as Twilio endpoint.

### WebSocket API

**Endpoint:**
```
wss://api.elevenlabs.io/v1/convai/conversation?agent_id={agent_id}
```

**Authentication:**
- Public agents: Direct connection
- Private agents: Get signed URL first

**Get Signed URL:**
```
GET https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id={agent_id}
```

**Client-to-Server Events:**
```json
{
  "type": "contextual_update",
  "text": "User clicked pricing page"
}
```

**Server-to-Client Events:**
- `user_transcript`: User speech transcribed
- `agent_response`: Agent text response
- `audio`: Base64 audio chunks
- `interruption`: Conversation interrupted
- `ping`: Heartbeat

---

## 8. SDKs & Libraries

### Official SDKs

| Platform | Package |
|----------|---------|
| JavaScript | `npm install @11labs/client` |
| Python | `pip install elevenlabs` |
| React | `@11labs/react` |
| iOS (Swift) | Available |
| Flutter | Available |
| Kotlin | Available |

### JavaScript SDK Example

```javascript
import { ElevenLabsClient } from '@11labs/client';

const client = new ElevenLabsClient();

// Start conversation session
const session = await client.startSession({
  agentId: 'your_agent_id',
  onConnect: () => console.log('Connected'),
  onDisconnect: () => console.log('Disconnected'),
  onMessage: (msg) => console.log('Message:', msg),
  onError: (err) => console.error('Error:', err),
  onStatusChange: (status) => console.log('Status:', status),
  onModeChange: (mode) => console.log('Mode:', mode)
});

// End conversation
session.endSession();
```

### Python SDK Example

```python
from elevenlabs import ElevenLabsClient

client = ElevenLabsClient(api_key="your_api_key")

# Get conversation details
conversation = client.conversational_ai.conversations.get("conv_123")
print(conversation.transcript)

# Initiate outbound call
result = client.conversational_ai.twilio.outbound_call(
    agent_id="agent_123",
    agent_phone_number_id="phone_456",
    to_number="+14155552671"
)
```

---

## 9. Pricing

### Per-Minute Rates (as of 2025)

| Plan | Rate | Notes |
|------|------|-------|
| Creator/Pro | $0.10/min | ~50% discount from previous |
| Business (annual) | $0.08/min | 13,750 mins included |
| Enterprise | <$0.08/min | Volume discounts |

### Additional Costs

- **LLM usage**: Third-party models (GPT-4, Claude) add 10-30% to bill
- **Setup/testing**: Billed at half the normal rate
- **Free tier**: 15 minutes included

### Plan Comparison

| Feature | Free | Creator | Business |
|---------|------|---------|----------|
| Minutes | 15 | Varies | 13,750+ |
| Languages | 30+ | 30+ | 30+ |
| Concurrency | Limited | Limited | ~30 sessions |
| Voice cloning | Limited | Yes | Multiple options |

---

## 10. Quick Start Checklist

### Web Integration

1. Create agent in ElevenLabs dashboard
2. Configure system prompt, voice, LLM
3. Add knowledge base (optional)
4. Set up tools/webhooks (optional)
5. Install SDK: `npm install @11labs/client`
6. Initialize session with agent ID
7. Handle audio I/O

### Phone (Twilio) Integration

1. Create agent in dashboard
2. Configure voice (μ-law 8000 Hz)
3. Navigate to Phone Numbers tab
4. Add Twilio credentials (SID, Auth Token)
5. Import phone number
6. Assign agent to number
7. Test inbound call
8. Set up post-call webhooks
9. Use API for outbound calls

---

## 11. Key Links

- **Documentation**: https://elevenlabs.io/docs/agents-platform/overview
- **API Reference**: https://elevenlabs.io/docs/api-reference/introduction
- **Twilio Integration**: https://elevenlabs.io/docs/agents-platform/phone-numbers/twilio-integration/native-integration
- **Webhooks**: https://elevenlabs.io/docs/agents-platform/workflows/post-call-webhooks
- **Prompting Guide**: https://elevenlabs.io/docs/agents-platform/best-practices/prompting-guide
- **Pricing**: https://elevenlabs.io/pricing

---

*Research compiled: January 2026*
