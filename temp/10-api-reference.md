# Voqo AI REST API Reference

## API Overview

### Base URL
```
https://api.voqo.ai
```

### Authentication
All API requests require Bearer token authentication.

**Header Format:**
```
Authorization: Bearer YOUR_API_KEY
```

### API Key Generation
API keys generated from workspace settings in the Voqo AI Platform:
- URL: `https://platform.voqo.ai`
- Navigate to workspace settings to create/manage API keys
- Keys require specific scopes (e.g., `start_call`) for endpoint access

### Supported Auth Methods
| Method | Use Case |
|--------|----------|
| Clerk JWT | Dashboard/web application access |
| API Key | Programmatic access (requires appropriate scope) |

---

## Endpoints

### Start Call

Initiate an outbound call using a specific voice AI agent.

#### Request

**Method:** `POST`

**Path:**
```
/api/v1/workspaces/{workspace_id}/agents/{agent_id}/start-call
```

**Content-Type:** `application/json`

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `workspace_id` | string | Yes | Identifier for the workspace |
| `agent_id` | string | Yes | Identifier for the agent |

#### Request Body

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `to_phone` | string | Yes | - | Target phone number for the outbound call |
| `from_phone` | string \| null | No | Workspace default | Source phone number; if omitted, uses workspace configuration |
| `record` | boolean \| null | No | `true` | Call recording toggle |
| `parameters` | object \| null | No | `null` | Custom key-value pairs for call personalization (string values only) |

**Example Request Body:**
```json
{
  "to_phone": "+14155551234",
  "from_phone": "+14155550000",
  "record": true,
  "parameters": {
    "customer_name": "John Doe",
    "appointment_time": "3:00 PM"
  }
}
```

#### Response

**Status Code:** `201 Created`

**Content-Type:** `application/json`

| Field | Type | Description |
|-------|------|-------------|
| `to_phone` | string | Recipient phone number |
| `created_by` | string | Email or identifier of call initiator |
| `from_phone` | string \| null | Originating phone number |
| `record` | boolean \| null | Recording status |
| `status` | enum | Call state (see status enum below) |
| `created_at` | string (ISO 8601) \| null | Call creation timestamp |

**Example Response:**
```json
{
  "to_phone": "+14155551234",
  "created_by": "user@example.com",
  "from_phone": "+14155550000",
  "record": true,
  "status": "created",
  "created_at": "2024-01-15T10:30:00Z"
}
```

#### Status Enum

Call lifecycle states:

| Status | Description |
|--------|-------------|
| `created` | Call request received and queued |
| `initiated` | Call is being placed |
| `connected` | Call connected to recipient |
| `inprogress` | Call is active |
| `completed` | Call ended successfully |
| `failed` | Call failed to complete |

#### Error Responses

| Status Code | Description |
|-------------|-------------|
| `401 Unauthorized` | Invalid token or API key |
| `403 Forbidden` | Missing `start_call` scope or unauthorized workspace access |
| `404 Not Found` | Workspace, agent, or phone number not found |
| `422 Unprocessable Entity` | Missing or malformed `to_phone` field |
| `500 Internal Server Error` | Server error |

---

## Complete Example

### cURL Request
```bash
curl -X POST "https://api.voqo.ai/api/v1/workspaces/{workspace_id}/agents/{agent_id}/start-call" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to_phone": "+14155551234",
    "from_phone": "+14155550000",
    "record": true,
    "parameters": {
      "customer_name": "John Doe"
    }
  }'
```

### Python Request
```python
import requests

url = "https://api.voqo.ai/api/v1/workspaces/{workspace_id}/agents/{agent_id}/start-call"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}
payload = {
    "to_phone": "+14155551234",
    "from_phone": "+14155550000",
    "record": True,
    "parameters": {
        "customer_name": "John Doe"
    }
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())
```

### JavaScript/Node.js Request
```javascript
const response = await fetch(
  `https://api.voqo.ai/api/v1/workspaces/${workspaceId}/agents/${agentId}/start-call`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      to_phone: '+14155551234',
      from_phone: '+14155550000',
      record: true,
      parameters: {
        customer_name: 'John Doe'
      }
    })
  }
);

const data = await response.json();
console.log(data);
```
