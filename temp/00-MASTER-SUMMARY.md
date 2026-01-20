# Voqo Feature Map - Master Summary

## Documentation Files Created

| File | Domain | Key Contents |
|------|--------|--------------|
| `01-onboarding.md` | Signup/Setup | Account creation, auto-agent, MMI codes, device caveats |
| `02-agent-settings.md` | Agent Config | General/advanced settings, prompts, voice, LLM model |
| `03-call-routing.md` | Call Forwarding | AU/US carriers, MMI codes, dual SIM, Live Voicemail |
| `04-function-calls.md` | In-Call Actions | End Call, Transfer, Custom API calls (full spec) |
| `05-post-call-actions.md` | Post-Call | SMS, Email, Webhook, SMS-to-caller |
| `06-contacts-memories.md` | CRM-lite | Contacts, vCard import, per-contact memories |
| `07-numbers-calllogs.md` | Phone Numbers | Purchase numbers, assign to agents, call logs |
| `08-outbound-calling.md` | Outbound | Individual calls, batch campaigns, jobs, uploads |
| `09-integrations-webhooks.md` | Integrations | Knowledge Base (REA/Domain), Webhooks (full payload) |
| `10-api-reference.md` | API | REST API, Start Call endpoint, auth |

---

## Core Feature Categories

### 1. TELEPHONY LAYER
- **Call Forwarding**: User keeps their number, forwards missed calls to Voqo agent number
- **Voqo Numbers**: Purchase AU/US numbers, assign to agents
- **Inbound Calls**: Agent answers, converses, triggers actions
- **Outbound Calls**: Individual + batch calling

### 2. AGENT CONFIGURATION
- **General**: Name, voice (6 options), enable/disable
- **Advanced**: LLM model, timezone, ambient noise, recording, interruptible, speech speed, keywords
- **Prompts**: Templates (Receptionist, Property Agent, Custom) + Magic Refiner

### 3. IN-CALL ACTIONS (Function Calls)
- **End Call**: Customizable goodbye
- **Transfer Call**: Warm/cold transfer, contact mapping, AU only
- **Custom Functions**: Full REST API client (auth, retry, extraction)

### 4. POST-CALL AUTOMATION
- **SMS to You**: 25 credits, summary
- **Email Summary**: 20 credits, transcript + recording
- **Webhook**: Free, JSON payload, HMAC signature
- **SMS to Caller**: Free (branded) or 20 credits (custom)

### 5. CONTACTS & MEMORIES
- **Contacts**: Name, phones (E.164), notes, vCard batch import
- **Memories**: Per-contact, save/use toggles, paid-only

### 6. INTEGRATIONS
- **Knowledge Base**: REA, Domain.com.au, Google Calendar
- **Webhooks**: call_ended event, 3 retries, 5s backoff
- **API**: REST, Bearer auth, Start Call endpoint

### 7. BATCH CALLING
- **Campaigns**: Grouping container
- **Uploads**: CSV/XLSX with phone_number + dynamic vars
- **Jobs**: Execute campaigns, download reports

---

## Credit Costs (from docs)

| Action | Cost |
|--------|------|
| Inbound call | 30 credits/min |
| Outbound call | 30 credits/min |
| Transfer request | 10 credits |
| Transfer active | 40 credits/min |
| SMS post-call | 25 credits |
| Email summary | 20 credits |
| SMS to caller (custom) | 20 credits |
| SMS to caller (branded) | Free |
| Webhook | Free |
| Custom function call | Free |

---

## Implied Tech Stack (from behavior)

- **Telephony**: Twilio/Vonage/similar (SIP trunking, number provisioning)
- **Voice AI**: Real-time STT + LLM + TTS pipeline
- **LLM**: Configurable model selection
- **Storage**: Call recordings (6mo retention), transcripts
- **Webhooks**: HMAC-SHA256 signed payloads
- **Database**: Workspaces, Agents, Contacts, Calls, Numbers, Campaigns, Jobs

---

## Ready for Discussion

**Questions to decide:**
1. Which features to include in MVP?
2. Which features to exclude?
3. What to add that Voqo doesn't have?
4. Tech stack choices (telephony provider, LLM, database)?
5. Open-source licensing model?
6. Self-hosted vs managed?
