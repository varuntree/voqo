# Voqo AI - Quick Start & Onboarding Documentation

## 1. Complete Signup Flow

### Account Creation
- Create account at **platform.voqo.ai**
- Agent created automatically upon signup (default behavior)
- Agent phone number provided in welcome email

### Prerequisites Before Setup
- Active cellular service required
- Good network reception essential
- Have agent's phone number ready (from welcome email)

---

## 2. Default Agent Creation Behavior

- **Automatic:** Agent created immediately when account is registered
- No manual agent creation needed for initial setup
- Agent configuration can be modified post-creation via "Agents" tab

---

## 3. Call Forwarding Setup Steps

### Phase 1: Connect Agent
1. Click "Connect Agent" button on dashboard
2. Review setup instructions
3. Follow device-specific prerequisites (see Section 4)
4. Complete all instructions before proceeding

### Phase 2: Enable Call Forwarding (Manual Method)
1. Open phone's dialer app
2. Dial: `**004*[agent_number]#`
   - Replace `[agent_number]` with actual number from welcome email
   - Example: `**004*1234567890#`
3. Press call button
4. Wait for confirmation message

### Phase 3: Configure Agent Settings
Navigate to "Agents" tab to modify:
- Agent name
- Conversation template
- Post-call actions
- Other behavioral settings

---

## 4. iPhone/Android Caveats

### iPhone Users
- **CRITICAL:** Must disable "Live Voicemail" feature BEFORE setup
- Allow "Call Forwarding" if prompted in phone settings
- Standard setup process otherwise

### Android Users
- Compatible with all Android devices
- **Samsung devices:** May require additional confirmation steps

### Dual SIM Users (Both Platforms)
- Must select correct SIM card for call transfer during setup
- Ensure forwarding configured on intended line

### Unsupported Carriers
- **Felix Mobile** - Not supported
- **AmaySim** - Not supported

---

## 5. Testing Procedure

1. Have someone (friend) call your number
2. Do NOT answer the incoming call
3. Let it go to the AI agent
4. Receive AI agent notification within minutes post-call
5. Verify agent handled call correctly

---

## 6. Agent Removal Process

### Method 1: Temporary Disable (Preferred)
1. Log into platform.voqo.ai
2. Navigate to "Agents" tab
3. Toggle "Agent Disable" switch
4. Agent stays connected but call forwarding disabled

### Method 2: Permanent Disable via MMI Code
1. Open phone's dialer app
2. Dial: `##002#`
3. Press call button
4. Wait for confirmation that call forwarding disabled

### Method 3: Alternative Disable Codes
If primary code fails:
- `#21#` - Disables all call forwarding
- `##21#` - Alternative for some carriers

### Re-enabling Agent
- Repeat initial setup process with agent number
- Use: `**004*[agent_number]#`

---

## 7. All MMI Codes

| Code | Function |
|------|----------|
| `**004*[number]#` | Enable conditional call forwarding to agent |
| `##002#` | Disable all conditional call forwarding (primary) |
| `#21#` | Disable all call forwarding (alternative) |
| `##21#` | Disable call forwarding (alternative for some carriers) |

### MMI Code Usage Notes
- Include ALL `#` and `*` symbols exactly as shown
- Press call button after entering code
- Wait for carrier confirmation message
- Codes work identically on iPhone and Android
- Some carriers may require pressing call button explicitly

---

## 8. Troubleshooting

### Setup Issues
- Verify exact code entry including all symbols
- Ensure adequate cellular reception
- Restart phone if unsuccessful
- Contact carrier customer service as last resort

### Carrier-Specific Support (Australia)
- **Telstra:** Official support portal
- **Vodafone:** Call-forwarding help documentation
- **Optus:** Divert cancellation guide

### Voqo Support
- Book support call via Google Calendar
- Provide:
  - Phone model
  - Carrier name
  - Any error messages
  - Agent number

---

## Quick Reference

### Setup Checklist
- [ ] Account created at platform.voqo.ai
- [ ] Agent phone number received (welcome email)
- [ ] Active cellular service confirmed
- [ ] Good network reception
- [ ] iPhone: Live Voicemail disabled
- [ ] Dual SIM: Correct SIM selected
- [ ] Call forwarding enabled via `**004*[number]#`
- [ ] Test call completed successfully

### Disable Checklist
- [ ] Dial `##002#` or use platform toggle
- [ ] Confirmation received from carrier
