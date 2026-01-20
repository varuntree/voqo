# Custom Functions Specification

## Overview
Custom functions allow agents to call external APIs during conversations. This enables real-time data lookup, CRM updates, calendar checks, and other integrations.

---

## How It Works

1. User defines a function in the dashboard (name, description, endpoint, auth)
2. Function is synced to ElevenLabs as an agent tool
3. During calls, the agent can invoke the function based on conversation context
4. Our backend receives the tool call, executes the HTTP request
5. Response is returned to the agent to continue conversation

---

## Architecture

```
┌─────────────────┐
│  ElevenLabs     │
│  Voice Agent    │
└────────┬────────┘
         │ Tool call webhook
         ▼
┌─────────────────┐
│  Our App        │
│  /api/functions │
│  /execute       │
└────────┬────────┘
         │ HTTP request
         ▼
┌─────────────────┐
│  External API   │
│  (CRM, Calendar,│
│   Property DB)  │
└─────────────────┘
```

---

## Function Data Model

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Auto | Unique identifier |
| agentId | UUID | Yes | Parent agent |
| name | string | Yes | Function name (unique per agent) |
| description | string | Yes | Description for LLM to understand usage |
| endpoint | string | Yes | API endpoint URL |
| method | enum | Yes | HTTP method |
| headers | JSON | No | Additional headers |
| authType | enum | Yes | 'none', 'api_key', 'bearer', 'basic' |
| authConfig | JSON | No | Auth credentials (encrypted) |
| parameters | JSON | Yes | JSON Schema for parameters |
| responseMapping | JSON | No | Map response fields to variables |
| timeout | integer | No | Timeout in seconds (default: 30) |
| enabled | boolean | Yes | Whether function is active |

---

## Authentication Types

### None
No authentication required.

### API Key
```json
{
  "authType": "api_key",
  "authConfig": {
    "key": "your-api-key",
    "headerName": "X-API-Key"  // or use queryParam
    // OR
    "queryParam": "api_key"
  }
}
```

### Bearer Token
```json
{
  "authType": "bearer",
  "authConfig": {
    "token": "your-bearer-token"
  }
}
```

### Basic Auth
```json
{
  "authType": "basic",
  "authConfig": {
    "username": "user",
    "password": "pass"
  }
}
```

---

## Parameter Schema

Uses JSON Schema format:

```json
{
  "type": "object",
  "properties": {
    "address": {
      "type": "string",
      "description": "Property address to look up"
    },
    "include_price": {
      "type": "boolean",
      "description": "Whether to include price information",
      "default": true
    }
  },
  "required": ["address"]
}
```

---

## Response Mapping

Map API response fields to variables the agent can reference:

```json
{
  "status": "data.listing_status",
  "price": "data.price.display",
  "bedrooms": "data.features.bedrooms",
  "address": "data.address.full"
}
```

Supports:
- Dot notation: `data.nested.field`
- Array access: `data.items[0].name`
- Wildcard: `data.items[*].name` (returns array)

---

## Example Functions

### 1. Property Lookup

```json
{
  "name": "check_property",
  "description": "Look up property details by address. Use when caller asks about a specific property.",
  "endpoint": "https://api.realestate.com/v1/properties/search",
  "method": "GET",
  "authType": "api_key",
  "authConfig": {
    "key": "xxx",
    "headerName": "X-API-Key"
  },
  "parameters": {
    "type": "object",
    "properties": {
      "address": {
        "type": "string",
        "description": "Property address"
      }
    },
    "required": ["address"]
  },
  "responseMapping": {
    "status": "data.status",
    "price": "data.price",
    "bedrooms": "data.bedrooms",
    "bathrooms": "data.bathrooms"
  }
}
```

### 2. Check Calendar Availability

```json
{
  "name": "check_availability",
  "description": "Check if a time slot is available for inspection. Use when caller wants to book an inspection.",
  "endpoint": "https://api.calendly.com/scheduled_events",
  "method": "GET",
  "authType": "bearer",
  "authConfig": {
    "token": "xxx"
  },
  "parameters": {
    "type": "object",
    "properties": {
      "date": {
        "type": "string",
        "description": "Date to check (YYYY-MM-DD)"
      },
      "time": {
        "type": "string",
        "description": "Time to check (HH:MM)"
      }
    },
    "required": ["date"]
  },
  "responseMapping": {
    "available": "data.available",
    "slots": "data.available_slots[*].time"
  }
}
```

### 3. Log Lead to CRM

```json
{
  "name": "log_lead",
  "description": "Log a new lead to the CRM. Use when you've gathered caller's interest and contact info.",
  "endpoint": "https://api.hubspot.com/crm/v3/objects/contacts",
  "method": "POST",
  "authType": "bearer",
  "authConfig": {
    "token": "xxx"
  },
  "parameters": {
    "type": "object",
    "properties": {
      "name": {
        "type": "string",
        "description": "Caller's name"
      },
      "phone": {
        "type": "string",
        "description": "Caller's phone number"
      },
      "interest": {
        "type": "string",
        "description": "What they're interested in"
      },
      "budget": {
        "type": "string",
        "description": "Budget range if mentioned"
      }
    },
    "required": ["name", "phone"]
  }
}
```

---

## Function Execution

### Endpoint: POST /api/functions/execute

This endpoint is called by ElevenLabs when the agent invokes a tool.

**Request (from ElevenLabs):**
```json
{
  "tool_call_id": "call_abc123",
  "tool_name": "check_property",
  "parameters": {
    "address": "45 Beach Street, Bondi"
  },
  "conversation_id": "conv_xyz"
}
```

**Process:**
```typescript
export async function POST(request: Request) {
  const { tool_name, parameters, conversation_id } = await request.json();

  // 1. Find function by name
  const func = await db.query.customFunctions.findFirst({
    where: eq(customFunctions.name, tool_name)
  });

  if (!func || !func.enabled) {
    return Response.json({
      error: "Function not found or disabled"
    }, { status: 404 });
  }

  // 2. Build request
  const url = buildUrl(func.endpoint, parameters);
  const headers = buildHeaders(func);
  const body = func.method !== 'GET' ? JSON.stringify(parameters) : undefined;

  // 3. Execute with timeout
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), func.timeout * 1000);

  try {
    const response = await fetch(url, {
      method: func.method,
      headers,
      body,
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return Response.json({
        error: `API returned ${response.status}`
      });
    }

    const data = await response.json();

    // 4. Map response
    const mapped = mapResponse(data, func.responseMapping);

    return Response.json({
      success: true,
      result: mapped
    });

  } catch (error) {
    clearTimeout(timeout);

    if (error.name === 'AbortError') {
      return Response.json({ error: 'Request timeout' });
    }

    return Response.json({ error: error.message });
  }
}
```

---

## ElevenLabs Tool Sync

When a function is created/updated, sync to ElevenLabs agent:

```typescript
async function syncFunctionToElevenLabs(func: CustomFunction, agent: Agent) {
  // Get current agent config
  const agentConfig = await elevenlabs.getAgent(agent.elevenlabsAgentId);

  // Build tool definition
  const tool = {
    type: "webhook",
    name: func.name,
    description: func.description,
    parameters: func.parameters,
    webhook: {
      url: `${process.env.NEXT_PUBLIC_APP_URL}/api/functions/execute`,
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      }
    }
  };

  // Update agent with new tool
  const existingTools = agentConfig.conversation_config.tools || [];
  const toolIndex = existingTools.findIndex(t => t.name === func.name);

  if (toolIndex >= 0) {
    existingTools[toolIndex] = tool;
  } else {
    existingTools.push(tool);
  }

  await elevenlabs.updateAgent(agent.elevenlabsAgentId, {
    conversation_config: {
      ...agentConfig.conversation_config,
      tools: existingTools
    }
  });
}
```

---

## Function Builder UI

### Location
Agent detail page → "Custom Functions" tab

### List View

| Column | Description |
|--------|-------------|
| Name | Function name |
| Description | Truncated description |
| Method | GET/POST/etc badge |
| Enabled | Toggle switch |
| Actions | Edit, Delete |

### Create/Edit Form

**Sections:**

1. **Basic Info**
   - Name (text, required, validated for uniqueness)
   - Description (textarea, required)

2. **API Configuration**
   - Endpoint URL (text, required, validated)
   - HTTP Method (select: GET, POST, PUT, PATCH, DELETE)
   - Timeout (number, default 30)

3. **Authentication**
   - Auth Type (select: None, API Key, Bearer, Basic)
   - Conditional fields based on type:
     - API Key: key input, header name or query param
     - Bearer: token input
     - Basic: username, password inputs

4. **Parameters**
   - JSON Schema editor (code editor or form builder)
   - Help text explaining format

5. **Response Mapping**
   - Key-value pairs editor
   - Left: variable name, Right: JSON path
   - Help text with dot notation examples

6. **Test**
   - Test parameters input (JSON)
   - "Test Function" button
   - Result display

### Code Example for Form

```tsx
function FunctionForm({ agentId, function: fn, onSave }: FunctionFormProps) {
  const [formData, setFormData] = useState({
    name: fn?.name || '',
    description: fn?.description || '',
    endpoint: fn?.endpoint || '',
    method: fn?.method || 'GET',
    authType: fn?.authType || 'none',
    authConfig: fn?.authConfig || {},
    parameters: fn?.parameters || { type: 'object', properties: {} },
    responseMapping: fn?.responseMapping || {},
    timeout: fn?.timeout || 30,
    enabled: fn?.enabled ?? true
  });

  const [testParams, setTestParams] = useState('{}');
  const [testResult, setTestResult] = useState(null);

  const handleTest = async () => {
    const response = await fetch('/api/functions/test', {
      method: 'POST',
      body: JSON.stringify({
        ...formData,
        testParameters: JSON.parse(testParams)
      })
    });
    const result = await response.json();
    setTestResult(result);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields... */}

      <div className="border-t pt-4">
        <Label>Test Function</Label>
        <Textarea
          value={testParams}
          onChange={(e) => setTestParams(e.target.value)}
          placeholder='{"address": "45 Beach St"}'
        />
        <Button type="button" onClick={handleTest}>
          Test
        </Button>

        {testResult && (
          <pre className="mt-2 p-4 bg-muted rounded">
            {JSON.stringify(testResult, null, 2)}
          </pre>
        )}
      </div>
    </form>
  );
}
```

---

## API Endpoints

### GET /api/agents/[agentId]/functions
List functions for an agent.

### POST /api/agents/[agentId]/functions
Create function.

**Side Effects:**
- Sync to ElevenLabs

### GET /api/functions/[id]
Get function detail.

### PATCH /api/functions/[id]
Update function.

**Side Effects:**
- Sync to ElevenLabs

### DELETE /api/functions/[id]
Delete function.

**Side Effects:**
- Remove from ElevenLabs agent tools

### POST /api/functions/test
Test function without saving.

**Request:**
```json
{
  "endpoint": "https://...",
  "method": "GET",
  "authType": "api_key",
  "authConfig": { ... },
  "testParameters": { "address": "..." }
}
```

### POST /api/functions/execute
Execute function (called by ElevenLabs).

---

## Security Considerations

1. **Credential Storage**: Auth configs stored encrypted in database
2. **Credential Display**: Never show full credentials in UI (masked)
3. **Endpoint Validation**: Validate URLs, block localhost/internal IPs
4. **Timeout**: Enforce maximum timeout to prevent hanging
5. **Rate Limiting**: Consider per-function rate limits (future)
6. **Audit Logging**: Log all function executions (future)

---

## Error Handling

| Error | Agent Receives |
|-------|----------------|
| Function not found | "I'm unable to look that up right now" |
| API timeout | "The system is taking too long, let me try something else" |
| API error (4xx/5xx) | "I'm having trouble accessing that information" |
| Invalid response | "I received unexpected information, let me help another way" |

The agent's prompt should include guidance on handling function failures gracefully.
