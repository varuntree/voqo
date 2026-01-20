# ElevenLabs Conversational AI Agent Tools & Function Calling

## Overview

ElevenLabs agents can use tools to perform actions beyond text generation - interacting with external systems, executing custom logic, controlling conversation flow.

---

## Tool Types

Four categories:

| Type | Description | Execution Location |
|------|-------------|-------------------|
| **Server/Webhook** | External API calls | ElevenLabs servers |
| **Client** | Frontend functions | User's app (browser/mobile) |
| **System** | Built-in conversation control | Platform internal |
| **MCP** | Model Context Protocol servers | External MCP servers |

---

## 1. Server/Webhook Tools

External API integration for real-time data retrieval and actions.

### Use Cases
- Fetch real-time data from REST APIs
- Trigger authenticated actions (scheduling, order updates)
- CRM/payment/booking integrations

### Configuration

```json
{
  "type": "webhook",
  "name": "get_weather",
  "description": "Fetches current weather for given coordinates",
  "response_timeout_secs": 20,
  "execution_mode": "immediate",
  "api_schema": {
    "url": "https://api.open-meteo.com/v1/forecast?latitude={latitude}&longitude={longitude}&current=temperature_2m",
    "method": "GET",
    "path_params_schema": {
      "latitude": {
        "type": "number",
        "description": "Latitude coordinate"
      },
      "longitude": {
        "type": "number",
        "description": "Longitude coordinate"
      }
    },
    "request_headers": {},
    "auth_connection": null
  }
}
```

### API Schema Fields

| Field | Type | Description |
|-------|------|-------------|
| `url` | string | Endpoint URL, supports `{param}` placeholders |
| `method` | enum | GET, POST, PUT, PATCH, DELETE |
| `request_headers` | object | Custom headers (can reference secrets) |
| `path_params_schema` | object | URL path parameter definitions |
| `query_params_schema` | object | URL query parameter definitions |
| `request_body_schema` | object | POST/PUT body schema |
| `content_type` | enum | `application/json` or `application/x-www-form-urlencoded` |
| `auth_connection` | object | Reference to workspace auth config |

### Authentication Methods

1. **OAuth2 Client Credentials**
   - Client ID, secret, token URL
   - Automatic token refresh
   - Optional scopes

2. **OAuth2 JWT**
   - JWT signing secret
   - Algorithm (default: HS256)
   - Claims: issuer, audience, subject

3. **Basic Auth**
   - Username/password
   - HTTP Basic header

4. **Bearer Token**
   - Token value stored as secret
   - Added to Authorization header

5. **Custom Headers**
   - Any name/value pairs
   - Reference secrets with `{{secret_name}}`

### Dynamic Parameter Generation

Agent extracts parameters from conversation context. Example system prompt:

```
When user asks about weather:
1. Determine location from conversation
2. Convert city name to coordinates (don't ask user for coordinates)
3. Call get_weather with latitude/longitude
4. Present temperature conversationally
```

---

## 2. Client Tools

Execute functions in user's frontend application.

### Use Cases
- DOM manipulation
- UI event triggering
- Client-side data access
- Local storage operations

### Configuration (API)

```json
{
  "type": "client",
  "name": "show_calendar",
  "description": "Displays calendar UI with specified date",
  "response_timeout_secs": 20,
  "expects_response": true,
  "parameters": {
    "type": "object",
    "properties": {
      "date": {
        "type": "string",
        "description": "Date in YYYY-MM-DD format"
      }
    },
    "required": ["date"]
  }
}
```

### SDK Implementation

**Python**
```python
from elevenlabs.conversational_ai.conversation import ClientTools, Conversation
from elevenlabs.conversational_ai.default_audio_interface import DefaultAudioInterface
from elevenlabs.client import ElevenLabs

client_tools = ClientTools()

# Sync tool
def show_calendar(params):
    date = params.get("date")
    # Trigger UI update
    return {"displayed": True, "date": date}

# Async tool
async def fetch_user_data(params):
    user_id = params.get("user_id")
    # Async operation
    return {"user": {"name": "John", "id": user_id}}

client_tools.register("show_calendar", show_calendar, is_async=False)
client_tools.register("fetch_user_data", fetch_user_data, is_async=True)

client = ElevenLabs(api_key="YOUR_API_KEY")

conversation = Conversation(
    client=client,
    agent_id="your-agent-id",
    requires_auth=True,
    audio_interface=DefaultAudioInterface(),
    client_tools=client_tools
)

conversation.start_session()
```

**JavaScript**
```javascript
const conversation = await Conversation.startSession({
  agentId: 'your-agent-id',
  clientTools: {
    show_calendar: async (params) => {
      const { date } = params;
      // DOM manipulation
      document.getElementById('calendar').dataset.date = date;
      return { displayed: true };
    }
  }
});
```

### Wait for Response

Enable `expects_response: true` when agent needs return data from client tool. The response is appended to conversation context.

---

## 3. System Tools (Built-in)

Platform tools for conversation state management - no external calls.

### Available System Tools

| Tool | Purpose | Parameters |
|------|---------|------------|
| `end_call` | Terminate conversation | `reason` (required), `message` (optional) |
| `language_detection` | Switch to detected language | `reason`, `language` code |
| `transfer_to_agent` | Route to another AI agent | `agent_number` (zero-indexed) |
| `transfer_to_number` | Route to human/phone | `transfer_number`, `client_message`, `agent_message` |
| `skip_turn` | Pause without speaking | `reason` |
| `play_keypad_touch_tone` | Send DTMF tones | `dtmf_tones` sequence |
| `voicemail_detection` | Detect voicemail systems | `reason` |

### Configuration

```json
{
  "type": "system",
  "name": "end_call",
  "description": "End call when task completed or user says goodbye",
  "response_timeout_secs": 20,
  "params": {
    "reason": "Task completed",
    "message": "Thank you for calling. Goodbye!"
  }
}
```

### End Call Configuration

```json
{
  "type": "system",
  "name": "end_call",
  "description": "End call when: user says goodbye/thank you, all questions answered, task completed"
}
```

LLM triggers based on:
- Task completion with user satisfaction
- Natural conversation conclusion
- Explicit user request to end

### Language Detection

```json
{
  "type": "system",
  "name": "language_detection",
  "description": "Detect and switch to user's language"
}
```

Supported languages must be configured in agent settings.

---

## 4. MCP Tools (Model Context Protocol)

Connect to external MCP servers for specialized capabilities.

### Configuration

Navigate to MCP integrations dashboard:
- **Name**: Server identifier
- **Description**: Capabilities overview
- **Server URL**: MCP endpoint
- **Secret Token**: Optional auth header
- **HTTP Headers**: Additional headers

### Supported Transports
- SSE (Server-Sent Events)
- HTTP Streamable

### Security Modes

| Mode | Description |
|------|-------------|
| **Always Ask** | Permission required before each tool use (recommended) |
| **Fine-Grained** | Per-tool approval settings |
| **No Approval** | Unrestricted tool access |

### Limitations
- Not available for Zero Retention Mode
- Not available for HIPAA-compliant accounts

---

## Tool Decision Making

### How Agent Selects Tools

1. **Tool descriptions** - LLM matches user intent to tool purpose
2. **System prompt instructions** - Explicit conditions for tool use
3. **Parameter descriptions** - Helps extract correct values from conversation

### Best Practices for Tool Descriptions

```
BAD:  "get_wx" - "gets wx data"
GOOD: "get_weather" - "Retrieves current weather conditions including temperature, humidity, and wind speed for a specified city or coordinates"
```

### System Prompt Guidance

```
You have access to these tools:
- get_weather: Use when user asks about weather conditions
- book_appointment: Use when user wants to schedule a meeting
- end_call: Use when conversation is complete and user says goodbye

Tool usage rules:
1. Never ask for coordinates - convert city names yourself
2. Confirm appointment details before booking
3. If a tool fails, apologize and try once more before escalating
```

---

## Response Handling

### Tool Response Flow

1. LLM decides to call tool
2. Parameters extracted from conversation
3. Tool executes (server/client/system)
4. Response added to conversation context
5. LLM generates response incorporating tool result

### Dynamic Variable Assignment

Extract and store values from tool responses:

```json
{
  "assignments": [
    {
      "source": "response",
      "dynamic_variable": "customer_name",
      "value_path": "user.name"
    },
    {
      "source": "response",
      "dynamic_variable": "order_total",
      "value_path": "order.total_amount"
    }
  ]
}
```

Variables usable in subsequent prompts/tools.

### Execution Modes

| Mode | Behavior |
|------|----------|
| `immediate` | Execute immediately, wait for response |
| `post_tool_speech` | Speak first, then execute |
| `async` | Execute in background |

---

## Tool Configuration Schema (Full)

### Webhook Tool

```json
{
  "type": "webhook",
  "name": "string (required)",
  "description": "string (required)",
  "response_timeout_secs": 20,
  "execution_mode": "immediate|post_tool_speech|async",
  "disable_interruptions": false,
  "force_pre_tool_speech": false,
  "tool_call_sound": "typing|elevator1|elevator2|elevator3|elevator4",
  "tool_call_sound_behavior": "auto|always",
  "api_schema": {
    "url": "string (required)",
    "method": "GET|POST|PUT|PATCH|DELETE",
    "request_headers": {},
    "path_params_schema": {},
    "query_params_schema": {},
    "request_body_schema": {},
    "content_type": "application/json",
    "auth_connection": {}
  },
  "dynamic_variables": {
    "dynamic_variable_placeholders": {}
  },
  "assignments": []
}
```

### Client Tool

```json
{
  "type": "client",
  "name": "string (required)",
  "description": "string (required)",
  "response_timeout_secs": 20,
  "expects_response": true,
  "execution_mode": "immediate",
  "parameters": {
    "type": "object",
    "properties": {},
    "required": []
  }
}
```

### System Tool

```json
{
  "type": "system",
  "name": "end_call|language_detection|transfer_to_agent|transfer_to_number|skip_turn|play_keypad_touch_tone|voicemail_detection",
  "description": "string",
  "response_timeout_secs": 20,
  "params": {}
}
```

---

## Tool Call Sounds

Ambient audio during tool execution:

| Sound | Description |
|-------|-------------|
| `typing` | Keyboard typing sounds |
| `elevator1-4` | Elevator music variants |

Behavior:
- `auto`: Play only when needed
- `always`: Always play during tool execution

---

## Error Handling

### System Prompt Instructions

```
When tools fail:
1. Acknowledge the issue naturally ("Let me try that again")
2. Retry once with same parameters
3. If still failing, ask user to verify information
4. After 2-3 failures, offer to escalate or try alternative

Never:
- Guess or fabricate data when tools fail
- Expose technical error messages to user
- Continue without addressing the failure
```

### Tool Response Timeout

Default: 20 seconds (configurable 1-120 seconds)

---

## Recommended LLMs for Tool Use

| Model | Tool Calling | Notes |
|-------|--------------|-------|
| GPT-4o | Excellent | Recommended |
| GPT-4o mini | Good | Cost-effective |
| Claude 3.5 Sonnet | Excellent | Recommended |
| Gemini 2.0 Flash | Fair | Avoid for complex tools |

Some LLMs struggle with parameter extraction. Higher intelligence models perform better.

---

## API Endpoint

**Create Agent with Tools**
```
POST https://api.elevenlabs.io/v1/convai/agents/create
Header: xi-api-key: YOUR_API_KEY

Body: {
  "conversation_config": {
    "agent": {
      "prompt": {
        "prompt": "Your system prompt",
        "llm": "gpt-4o",
        "tools": [
          // Tool configurations
        ]
      }
    }
  }
}
```

---

## Sources

- [Tools Overview](https://elevenlabs.io/docs/agents-platform/customization/tools)
- [Server Tools](https://elevenlabs.io/docs/agents-platform/customization/tools/server-tools)
- [Client Tools](https://elevenlabs.io/docs/agents-platform/customization/tools/client-tools)
- [System Tools](https://elevenlabs.io/docs/agents-platform/customization/tools/system-tools)
- [MCP Integration](https://elevenlabs.io/docs/agents-platform/customization/tools/mcp)
- [Create Agent API](https://elevenlabs.io/docs/agents-platform/api-reference/agents/create)
- [Python SDK](https://elevenlabs.io/docs/agents-platform/libraries/python)
- [Prompting Guide](https://elevenlabs.io/docs/agents-platform/best-practices/prompting-guide)
