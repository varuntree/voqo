# Voqo Post-Call Actions

## Overview

Post-call actions enable automated notifications via SMS, Email, Webhook, or combinations after calls end.

**Limit:** Maximum 10 post-call actions per agent.

---

## 1. Send SMS Action

### Contents
- Caller ID
- Contact name
- Call summary

### Cost
**25 credits per message**

### Limitations
- Transcripts and call recordings NOT included (email only)

### Use Case
Instant updates without checking email.

---

## 2. Send Email Summary

### Contents
- **Call Summary** - condensed conversation overview
- **Full Transcript** - complete dialogue record
- **Recording Link** - audio access (if recording enabled)
- Phone type (mobile/landline/VoIP)
- Call duration

### Cost
**20 credits per message**

### Recording Retention
Up to 6 months

### Setup Steps
1. Navigate to Agent Settings
2. Locate Post-call Actions section
3. Click "+" icon, select Email Summary
4. Input recipient email address
5. Click Add to save

### Requirements
- Valid email format mandatory
- Per-agent configuration (not global)
- Recording link depends on recording being enabled

### Troubleshooting
- Check spam folders
- Whitelist Voqo AI addresses
- Verify email syntax if format errors

---

## 3. Webhook Post-Call

### Cost
**Free**

### Delivery
JSON payload to specified endpoint once call ends.

### JSON Payload Structure
Includes:
- All email summary data
- Call status
- Precise start/end times
- Post-action results
- Conversation event timestamps
- Full transcript
- Recording URL

### Signature Verification
- Requires webhook secret configuration
- Configure in Developer Tools section
- Used to verify payload authenticity

### Benefits
- Real-time integration
- Custom automation
- Detailed logging

---

## 4. SMS to Caller

### Free Tier
- **Cost:** Free (0 credits)
- **Branding:** Voqo-branded, non-customizable
- **Contents:**
  - Your dialed number
  - Call summary
  - Growth loop (if interest detected)
  - Voqo branding appended

### Paid Tier
- **Cost:** 20 credits per custom message
- **Branding:** None - sent exactly as written
- **Customization:** Fully customizable via template variables

### Available Variables
| Variable | Description |
|----------|-------------|
| `call_summary` | AI-generated conversation summary |
| `your_number` | Number caller dialed |
| `agent_number` | Agent's phone number |
| `agent_name` | Agent's configured name |

### Growth Loop Logic
Default template analyzes transcript for caller interest and optionally includes signup invitation. Custom messages bypass this entirely.

---

## 5. No-Human-Input Handling

If call transcript contains **no human input**:
- No SMS to caller sent
- No credits charged

Applies to: abandoned calls, voicemails, no-response scenarios.

---

## 6. Setup Steps Summary

### SMS Notification
1. Go to Agent Settings
2. Open Post-call Actions
3. Click "+" > Select SMS
4. Enter recipient phone number
5. Save

### Email Summary
1. Go to Agent Settings
2. Open Post-call Actions
3. Click "+" > Select Email Summary
4. Enter recipient email
5. Save

### Webhook
1. Go to Agent Settings
2. Open Post-call Actions
3. Click "+" > Select Webhook
4. Enter endpoint URL
5. (Optional) Configure webhook secret in Developer Tools for signature verification
6. Save

### SMS to Caller
1. Go to Agent Settings
2. Open Post-call Actions
3. Click "+" > Select SMS to Caller
4. Choose Free (default template) or Paid (custom)
5. If custom: compose message using variables
6. Save

---

## Cost Summary

| Action | Cost |
|--------|------|
| SMS Notification | 25 credits |
| Email Summary | 20 credits |
| Webhook | Free |
| SMS to Caller (default) | Free |
| SMS to Caller (custom) | 20 credits |

---

## Configuration Notes

- All actions configurable per-agent (not global)
- Maximum 10 actions per agent
- Multiple channels can run simultaneously
- No API interface currently available for email configuration
