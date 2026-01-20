# Agents Specification

## Overview
Agents are AI voice assistants that handle phone calls. Each agent has a unique personality, prompt, and behavior configured through the dashboard.

---

## Agent Configuration

### Basic Settings

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Display name (e.g., "Lisa - Sales Agent") |
| description | string | No | Internal description/notes |
| template | enum | Yes | 'property_sales', 'property_manager', 'custom' |
| enabled | boolean | Yes | Whether agent accepts calls |

### Conversation Settings

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| system_prompt | string | Yes | Full system prompt for the agent |
| greeting_message | string | No | Opening message when call starts |

---

## Prompt Templates

### 1. Property Sales Agent

**Use case**: Handling inquiries about properties for sale, qualifying buyers, booking inspections.

```markdown
# Role
You are {agent_name}, a friendly and professional real estate sales assistant for {agency_name}. You help potential buyers with property inquiries and schedule inspections.

# Personality
- Warm and welcoming
- Professional but not stiff
- Knowledgeable about real estate
- Patient with questions
- Enthusiastic about properties

# Capabilities
- Answer questions about listed properties
- Qualify buyer interest (budget, timeline, preferences)
- Schedule property inspections
- Collect contact information
- Provide general market information

# Guidelines
- Always be helpful and positive
- If you don't know specific property details, offer to have an agent follow up
- Never pressure callers
- Collect name and callback number when possible
- For inspection bookings, confirm date, time, and property address

# Information to Collect
- Caller's name
- Contact number (confirm the one they're calling from)
- Property/properties of interest
- Budget range (if comfortable sharing)
- Timeline for purchase
- Preferred inspection times

# Closing
- Summarize any commitments made
- Confirm next steps
- Thank them for calling
- Wish them a great day
```

**Default Greeting**: "Hello! Thanks for calling {agency_name}. This is {agent_name}, how can I help you today?"

---

### 2. Property Manager Agent

**Use case**: Handling tenant calls, maintenance requests, general property management inquiries.

```markdown
# Role
You are {agent_name}, a helpful property management assistant for {agency_name}. You assist tenants with inquiries, maintenance requests, and general questions about their rental properties.

# Personality
- Calm and reassuring
- Efficient and organized
- Empathetic to tenant concerns
- Professional and helpful

# Capabilities
- Log maintenance requests
- Answer common tenancy questions
- Provide information about rent payments
- Take messages for property managers
- Handle after-hours emergencies appropriately

# Guidelines
- Treat all tenant concerns seriously
- For emergencies (flooding, fire, security), advise immediate action and escalate
- For non-urgent maintenance, collect details and confirm follow-up timeline
- Be clear about what you can and cannot do
- Always confirm the property address

# Information to Collect (Maintenance)
- Tenant name
- Property address
- Nature of the issue
- Urgency level
- Best contact number
- Preferred contact times
- Permission to enter (if needed)

# Emergency Protocol
If the issue is:
- Flooding/burst pipes: Advise to turn off water mains if safe, will escalate immediately
- Fire/smoke: Advise to evacuate and call 000, will notify management
- Security breach: Advise to call police if in danger, will escalate
- No hot water/heating in winter: Treat as urgent

# Closing
- Summarize the request
- Provide expected response timeframe
- Confirm contact details
- Thank them for calling
```

**Default Greeting**: "Hello! Thanks for calling {agency_name} property management. This is {agent_name}, how can I help you today?"

---

### 3. Custom Template

**Use case**: Blank slate for custom use cases.

```markdown
# Role
You are {agent_name}, an AI assistant for {business_name}.

# Guidelines
- Be helpful and professional
- Collect relevant information
- Offer to have someone follow up if you can't help

# Closing
- Thank them for calling
```

**Default Greeting**: "Hello! Thanks for calling. This is {agent_name}, how can I help you?"

---

## Template Variables

Variables that can be used in prompts and greetings:

| Variable | Description | Example |
|----------|-------------|---------|
| `{agent_name}` | Agent's display name | "Lisa" |
| `{agency_name}` | Business name (from settings) | "Ray White Sydney" |
| `{business_name}` | Alias for agency_name | "Ray White Sydney" |
| `{caller_name}` | Caller's name (if known from contacts) | "John Smith" |
| `{caller_phone}` | Caller's phone number | "+61412345678" |
| `{current_date}` | Today's date | "Monday, 15 January 2024" |
| `{current_time}` | Current time | "2:30 PM" |

---

## Memory Injection

When a call comes in from a known contact, their memories are injected into the system prompt:

```markdown
# Caller Context
The caller is {caller_name} ({caller_phone}).

Previous interactions and notes:
- Interested in 3-bedroom properties in Bondi area
- Budget around $1.5M
- Has two children, needs good school zone
- Previously inquired about 45 Beach St (sold)
- Prefers Saturday inspections
```

---

## ElevenLabs Sync

When an agent is created/updated in our system, it must be synced to ElevenLabs:

### Create Agent
```typescript
// POST https://api.elevenlabs.io/v1/convai/agents
{
  "name": "Lisa - Sales Agent",
  "conversation_config": {
    "agent": {
      "prompt": {
        "prompt": "Full system prompt here...",
        "llm": "gpt-4o",
        "temperature": 0.7
      },
      "first_message": "Hello! Thanks for calling...",
      "language": "en"
    },
    "asr": {
      "provider": "elevenlabs"
    },
    "tts": {
      "voice_id": "selected_voice_id"
    }
  }
}
```

### Update Agent
```typescript
// PATCH https://api.elevenlabs.io/v1/convai/agents/{agent_id}
// Same structure as create
```

---

## Agent UI Screens

### 1. Agent List (`/dashboard/agents`)

**Components:**
- Header with "Agents" title and "New Agent" button
- Agent cards in grid layout
- Each card shows:
  - Agent name
  - Template type badge
  - Enabled/disabled status toggle
  - Description preview
  - Last activity timestamp
  - Edit button
  - Delete button (with confirmation)

**Actions:**
- Click card → navigate to detail
- Toggle enabled → update agent
- New Agent → navigate to create

---

### 2. Create Agent (`/dashboard/agents/new`)

**Components:**
- Back link to list
- Form with sections:
  1. **Basic Info**
     - Name (text input)
     - Description (textarea, optional)
  2. **Template Selection**
     - Radio cards for each template
     - Shows template description
  3. **System Prompt**
     - Large textarea with prompt
     - Pre-filled based on template selection
     - Variables reference sidebar
  4. **Greeting Message**
     - Text input
     - Pre-filled based on template
  5. **Status**
     - Enabled toggle

**Actions:**
- Save → create agent, sync to ElevenLabs, redirect to list
- Cancel → redirect to list

---

### 3. Edit Agent (`/dashboard/agents/[id]`)

**Components:**
- Same as create, pre-filled with agent data
- Additional tabs:
  - **Overview** - basic settings
  - **Custom Functions** - list of functions for this agent
  - **Call History** - recent calls handled by this agent

**Actions:**
- Save → update agent, sync to ElevenLabs
- Delete → confirmation modal, delete agent
- Test Call → initiate test call (future feature)

---

## API Endpoints

### GET /api/agents
List all agents.

**Response:**
```json
{
  "agents": [
    {
      "id": "abc123",
      "name": "Lisa - Sales Agent",
      "description": "Handles property sales inquiries",
      "template": "property_sales",
      "enabled": true,
      "elevenlabsAgentId": "el_xyz",
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

### POST /api/agents
Create new agent.

**Request:**
```json
{
  "name": "Lisa - Sales Agent",
  "description": "Handles property sales inquiries",
  "template": "property_sales",
  "systemPrompt": "Full prompt...",
  "greetingMessage": "Hello! Thanks for calling...",
  "enabled": true
}
```

**Response:** Created agent object

**Side Effects:**
- Create agent in ElevenLabs
- Store ElevenLabs agent ID

### GET /api/agents/[id]
Get single agent.

### PATCH /api/agents/[id]
Update agent.

**Side Effects:**
- Update agent in ElevenLabs

### DELETE /api/agents/[id]
Delete agent.

**Side Effects:**
- Delete agent from ElevenLabs
- Cascade delete custom functions
- Preserve call history (set agent_id to null or keep reference)

---

## Voice Configuration

For MVP, voice is hardcoded. The voice ID should be stored in environment variables:

```env
ELEVENLABS_VOICE_ID=your_selected_voice_id
```

Voice settings applied to all agents:
- Stability: 0.7
- Similarity: 0.8
- Speed: 1.0

---

## Error Handling

| Scenario | Handling |
|----------|----------|
| ElevenLabs sync fails | Show error toast, allow retry |
| Agent name already exists | Validation error on form |
| Delete agent with active calls | Allow, preserve call history |
| Disabled agent receives call | ElevenLabs handles (agent still active there) |
