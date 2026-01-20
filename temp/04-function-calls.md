# Function Calls (In-Call Actions)

Agent actions triggered during active calls. Three types: End Call, Transfer Call, Custom Function Calls.

---

## 1. End Call Action

**Cost:** Free

### Configuration

| Field | Description |
|-------|-------------|
| Transition Message | Customizable goodbye message delivered before ending call |

---

## 2. Transfer Call Action

**Cost:**
- 10 credits per transfer request
- 40 credits/min for active transferred calls

### Configuration

| Field | Description |
|-------|-------------|
| Transition Message | Custom message before attempting transfer |
| Display Agent Caller ID | Toggle: transferee sees agent's or caller's phone number |
| Transfer Type | **Warm** (includes previous call summary) or **Cold** (no summary) |
| Transferrable Contacts | Name-to-phone mapping in E.164 format |

### Phone Number Format (E.164)
- AU Mobile: `+614XXXXXXXX`
- AU Landline: `+61XYYYYYYYY`
- Currently supports Australian numbers only

---

## 3. Custom Function Calls

**Cost:** Free

Execute external API calls during conversation. Full HTTP client with auth, retry, response extraction.

### 3.1 Function Metadata

| Field | Description | Example |
|-------|-------------|---------|
| Function Name | Unique identifier | `get_weather_forecast` |
| Function Description | Keywords + use cases for LLM context | "Retrieve weather forecast and climate data for specific locations" |
| Parameter Specification | JSON Schema (OpenAPI-compatible) | See below |

#### Parameter Schema Example
```json
{
  "type": "object",
  "properties": {
    "location": {
      "type": "string",
      "description": "City name or coordinates"
    },
    "days": {
      "type": "integer",
      "description": "Forecast days (1-7)"
    }
  },
  "required": ["location"]
}
```

### 3.2 API Request Configuration

| Field | Description | Default |
|-------|-------------|---------|
| API Endpoint | URL with parameter templating | - |
| HTTP Method | GET, POST, PUT, PATCH, DELETE | - |
| Timeout | Max wait seconds | 30 (max: 60) |

#### Endpoint Templating Syntax
Use `{parameter_name}` for dynamic URL construction:
```
https://api.weather.com/v1/forecast/{location}?days={days}
```

### 3.3 Authentication Methods

#### API Key Authentication
| Field | Description |
|-------|-------------|
| API Key | Key value (include prefix if required: "Bearer key" or "token key") |
| Header Name | Header to send key in (e.g., `Authorization`, `X-API-Key`) |
| Query Parameter Name | URL param name (e.g., `key`, `api_key`) |

#### Bearer Token Authentication
| Field | Description |
|-------|-------------|
| Bearer Token | OAuth2 access token (auto-prefixed with "Bearer ") |

#### Basic Authentication
| Field | Description |
|-------|-------------|
| Username | HTTP Basic username |
| Password | HTTP Basic password (hashed at storage) |

Credentials auto base64-encoded with "Basic " prefix.

#### Webhook Secret Authentication
| Field | Description | Default |
|-------|-------------|---------|
| Webhook Secret | HMAC signing secret | - |
| Event Type | Event identifier in payload | `voqo.custom_function_call` |

**Note:** POST requests only for webhook auth.

### 3.4 Response Processing

#### Extraction Mapping

Map API response fields to agent-accessible variables using dot notation:

| Syntax | Example | Description |
|--------|---------|-------------|
| Simple path | `current.temperature` | Nested object access |
| Array index | `forecast[0].date` | Specific array element |
| Wildcard | `forecast[*].tempMax` | All elements in array |

#### Example Mapping
```
temperature -> current.temperature
humidity -> current.humidity
forecast_dates -> forecast[*].date
first_forecast -> forecast[0].description
```

### 3.5 Error Mapping

Map HTTP status codes to user-friendly messages:

| Status Code | Suggested Message |
|-------------|-------------------|
| 401 | "Request failed due to system error. Please try again later." |
| 404 | "The requested resource was not found." |
| 500 | "Service temporarily unavailable." |

Custom messages per status code prevent exposing technical errors to callers.

### 3.6 Retry Configuration

| Field | Default | Description |
|-------|---------|-------------|
| Max Attempts | 3 | Total retry attempts |
| Initial Delay | 1.0s | First retry delay |
| Max Delay | 10.0s | Maximum delay cap |
| Backoff Factor | 2.0 | Exponential multiplier |

Retry sequence with defaults: 1s -> 2s -> 4s -> 8s -> 10s (capped)

### 3.7 Credential Security

- All secrets encrypted at rest
- Never stored in plain text
- Secrets auto-masked in UI
- Some services require prefixes (e.g., GitHub: "Bearer ghp_...")
- Rate limiting subject to provider limits

---

## Credit Cost Summary

| Action | Cost |
|--------|------|
| End Call | Free |
| Transfer Call (request) | 10 credits |
| Transfer Call (active) | 40 credits/min |
| Custom Function Call | Free |
