# Post-Call SMS Specification

## Overview
After each call, an SMS is automatically sent to the caller with a summary of the conversation. This uses Twilio Programmable SMS.

---

## Configuration

### Settings

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| sms_enabled | boolean | true | Enable/disable SMS sending |
| sms_template | string | (see below) | SMS template with variables |
| sms_skip_silent | boolean | true | Skip SMS if caller didn't speak |

### Default Template

```
Hi {caller_name}, thanks for calling! Here's a summary of our conversation:

{call_summary}

Feel free to call back anytime.
- {agent_name}
```

### Available Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `{caller_name}` | Contact name or "there" | "John" |
| `{caller_phone}` | Caller's phone number | "+61412345678" |
| `{call_summary}` | AI-generated summary | "Inquired about 45 Beach St..." |
| `{agent_name}` | Agent's name | "Lisa" |
| `{call_duration}` | Call duration | "2m 25s" |
| `{call_date}` | Call date | "January 15, 2024" |

---

## SMS Sending Flow

```
Call ends → Webhook received
              │
              ▼
        Check sms_enabled
              │
              ▼ (if enabled)
        Check sms_skip_silent
              │
              ▼ (if caller spoke)
        Build SMS content
              │
              ▼
        Send via Twilio
              │
              ▼
        Update call record (smsSent, smsSentAt)
```

---

## Implementation

### Twilio Client

```typescript
// lib/twilio/client.ts
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function sendSMS(to: string, body: string): Promise<string> {
  const message = await client.messages.create({
    to,
    from: process.env.TWILIO_PHONE_NUMBER,
    body
  });

  return message.sid;
}
```

### Post-Call SMS Function

```typescript
// lib/sms/post-call.ts

interface PostCallSMSParams {
  call: Call;
  contact: Contact | null;
  agent: Agent;
}

export async function sendPostCallSMS({
  call,
  contact,
  agent
}: PostCallSMSParams): Promise<boolean> {
  // Check if enabled
  const smsEnabled = await getSetting('sms_enabled');
  if (!smsEnabled) return false;

  // Get template
  const template = await getSetting('sms_template');

  // Build content
  const content = buildSMSContent(template, {
    caller_name: contact?.name || 'there',
    caller_phone: call.fromPhone,
    call_summary: call.summary || 'No summary available',
    agent_name: agent.name.split(' - ')[0], // "Lisa - Sales" → "Lisa"
    call_duration: formatDuration(call.duration || 0),
    call_date: formatDate(call.startedAt)
  });

  // Validate length (SMS limit: 1600 chars for concatenated)
  if (content.length > 1600) {
    console.warn('SMS content too long, truncating summary');
    // Truncate summary and rebuild
  }

  try {
    // Send SMS
    const callerPhone = call.direction === 'inbound' ? call.fromPhone : call.toPhone;
    await sendSMS(callerPhone, content);

    // Update call record
    await db.update(calls)
      .set({
        smsSent: 1,
        smsSentAt: new Date().toISOString()
      })
      .where(eq(calls.id, call.id));

    return true;
  } catch (error) {
    console.error('Failed to send post-call SMS:', error);
    return false;
  }
}

function buildSMSContent(template: string, variables: Record<string, string>): string {
  let content = template;

  for (const [key, value] of Object.entries(variables)) {
    content = content.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
  }

  return content;
}
```

### Webhook Handler Integration

```typescript
// In webhook handler (api/webhooks/elevenlabs/route.ts)

async function handleCallCompleted(payload: PostCallPayload) {
  // ... store call, match contact ...

  // Check skip silent
  const skipSilent = await getSetting('sms_skip_silent');
  const hasHumanSpeech = payload.transcript.some(t => t.role === 'user');

  if (skipSilent && !hasHumanSpeech) {
    console.log('Skipping SMS - no human speech detected');
    return;
  }

  // Send SMS
  await sendPostCallSMS({
    call,
    contact,
    agent
  });
}
```

---

## Settings UI

### Location
Settings page (`/dashboard/settings`) → "SMS Settings" section

### Components

```tsx
function SMSSettings() {
  const { data: settings, mutate } = useSettings();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Post-Call SMS</CardTitle>
        <CardDescription>
          Configure automatic SMS messages sent after calls
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enable Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <Label>Enable SMS</Label>
            <p className="text-sm text-muted-foreground">
              Send SMS to callers after each call
            </p>
          </div>
          <Switch
            checked={settings.sms_enabled}
            onCheckedChange={(checked) => updateSetting('sms_enabled', checked)}
          />
        </div>

        {/* Skip Silent Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <Label>Skip Silent Calls</Label>
            <p className="text-sm text-muted-foreground">
              Don't send SMS if caller didn't speak
            </p>
          </div>
          <Switch
            checked={settings.sms_skip_silent}
            onCheckedChange={(checked) => updateSetting('sms_skip_silent', checked)}
          />
        </div>

        {/* Template Editor */}
        <div className="space-y-2">
          <Label>SMS Template</Label>
          <Textarea
            value={settings.sms_template}
            onChange={(e) => updateSetting('sms_template', e.target.value)}
            rows={6}
          />
          <p className="text-sm text-muted-foreground">
            Available variables: {'{caller_name}'}, {'{call_summary}'}, {'{agent_name}'}, {'{call_duration}'}, {'{call_date}'}
          </p>
        </div>

        {/* Preview */}
        <div className="space-y-2">
          <Label>Preview</Label>
          <div className="rounded-lg border bg-muted p-4 text-sm">
            {buildSMSContent(settings.sms_template, {
              caller_name: 'John',
              call_summary: 'Inquired about 45 Beach St property. Interested in scheduling an inspection for Saturday.',
              agent_name: 'Lisa',
              call_duration: '2m 25s',
              call_date: 'January 15, 2024'
            })}
          </div>
          <p className="text-sm text-muted-foreground">
            {characterCount} / 1600 characters
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## API Endpoints

### GET /api/settings
Get all settings.

**Response:**
```json
{
  "sms_enabled": true,
  "sms_template": "Hi {caller_name}...",
  "sms_skip_silent": true,
  "auto_create_contacts": true,
  "save_memories": true
}
```

### PATCH /api/settings
Update settings.

**Request:**
```json
{
  "sms_template": "New template..."
}
```

### POST /api/sms/send
Manual SMS send (for testing or manual follow-up).

**Request:**
```json
{
  "to": "+61412345678",
  "body": "Custom message..."
}
```

**Response:**
```json
{
  "success": true,
  "messageSid": "SM..."
}
```

---

## Error Handling

| Error | Handling |
|-------|----------|
| Twilio API error | Log error, don't block webhook response |
| Invalid phone number | Skip SMS, log warning |
| Template too long | Truncate summary, send anyway |
| Rate limit | Retry with backoff (future enhancement) |

---

## SMS Length Considerations

- Single SMS: 160 characters (GSM-7) or 70 characters (Unicode)
- Concatenated SMS: Up to 1600 characters (billed per segment)
- Each segment: 153 characters (GSM-7) or 67 characters (Unicode)

### Recommendations
- Keep template concise
- Summary may be long - consider truncating
- Show character count in template editor
- Warn if exceeding 480 characters (~3 segments)
