# Voqo AI Call Routing / Connect Agent

## Overview

Voqo AI agents connect to phone numbers via **conditional call forwarding**. When someone calls your phone and you don't answer (or line busy/unreachable), the call forwards to your Voqo AI agent instead of voicemail.

### How It Works Conceptually

1. **User obtains agent phone number** from Voqo agent settings page
2. **User configures conditional call forwarding** on their mobile carrier
3. **When a call comes in:**
   - Phone rings for configured duration (ring delay)
   - If unanswered/busy/unreachable, call forwards to Voqo agent
   - Voqo AI handles the call
4. **Call logs** available in Voqo dashboard with transcripts, summaries, recordings

### Forwarding Types

| Type | Trigger | Use Case |
|------|---------|----------|
| **Unconditional (CFU)** | All calls immediately forwarded | Phone never rings |
| **No Answer (CF NRY)** | Forward after X seconds/rings | Phone rings first, then AI takes over |
| **Busy (CFB)** | Line is busy | Caller doesn't get busy signal |
| **Unreachable (CF NRC)** | Phone off/no signal | Calls still answered |
| **Conditional (004)** | Combines: no answer + busy + unreachable | **Recommended for Voqo** |

---

## Australia Carrier Instructions

### Pre-Setup Requirements

**iPhone users MUST disable call forwarding on device before setup:**
- Settings > Phone > Call Forwarding > OFF

### Telstra

**Enable Conditional Forwarding:**
```
**004*<agent_phone_number>*10#
```
Example: `**004*0878987876*10#`

**Ring Delay:**
- The `*10` suffix = 10 seconds before forwarding
- Default without suffix = 15 seconds
- Available options: 5, 10, 15, 20, 25, 30 seconds

**Alternative ring time format:**
```
**61*101**<seconds>#
```
Example: `**61*101**30#` for 30 seconds

**Check current settings:** `*#61#`

**Disable all forwarding:** `##002#` or `##004#`

**Disable specific types:**
| Type | Disable Code |
|------|-------------|
| Unconditional | `##21#` |
| No Answer | `##61#` |
| Busy | `##67#` |
| Unreachable | `##62#` |

---

### Optus

**Enable Conditional Forwarding:**
```
*004*<agent_phone_number>#
```
Example: `*004*0878987876#`

**Note:** Single asterisk (not double like Telstra)

**Ring Delay:**
- Default = 10 seconds
- For custom ring delay with Optus: `*61*<number>**10#` (double asterisk before delay)
- Contact 133 937 for adjustments beyond standard options

**Check status:** `*#61#`

**Disable all forwarding:** `##002#` or `##004#`

---

### Vodafone

**Enable Conditional Forwarding:**
```
*004*<agent_phone_number>#
```
Example: `*004*0878987876#`

**Ring Delay:**
- Fixed at 15 seconds
- Vodafone does NOT support ring time adjustment via dial codes

**Check status:** `#61#`

**Disable all forwarding:** `##002#` or `##004#`

---

### TPG, Boost Mobile, Woolworths Mobile

**Enable Conditional Forwarding:**
```
*004*<agent_phone_number>#
```
Example: `*004*0878987876#`

Same codes as Optus/Vodafone (these are MVNOs on those networks).

---

### Amaysim

**Setup via App only:**
1. Open Amaysim app or My Amaysim web portal
2. Navigate to Settings section
3. Enter agent phone number in "Forward calls to" field
4. Save changes

MMI codes may not work on Amaysim.

---

### Australia Universal Codes Summary

| Action | Code |
|--------|------|
| **Cancel ALL forwarding** | `##002#` |
| **Cancel conditional forwarding** | `##004#` |
| Check no-answer forwarding | `*#61#` |
| Check busy forwarding | `*#67#` |
| Check unreachable forwarding | `*#62#` |
| Check unconditional forwarding | `*#21#` |

---

## US Carrier Instructions

### AT&T

**Enable Conditional Forwarding (Busy/No Answer/Unreachable):**
```
*004*1<10_digit_number>#
```
Example: `*004*19085551234#`

**Individual conditional types:**
| Type | Enable | Disable |
|------|--------|---------|
| All Conditional | `*004*1<number>#` | `##004#` |
| No Answer | `*61*1<number>#` | `##61#` |
| Busy | `*67*1<number>#` | `##67#` |
| Unreachable | `*62*1<number>#` | `##62#` |

**Unconditional (all calls):**
- Enable: `**21*1<number>#`
- Disable: `##21#`

**Disable ALL forwarding:** `##004#` or `#002#`

---

### T-Mobile

**Enable Conditional Forwarding:**
```
**61*1<10_digit_number>#
```
Example: `**61*19085551234#`

**All forwarding types:**
| Type | Enable | Disable |
|------|--------|---------|
| Unconditional (all calls) | `**21*1+<number>#` | `##21#` |
| No Reply | `**61*1+<number>#` | `##61#` |
| Not Reachable | `**62*1+<number>#` | `##62#` |
| Busy | `**67*1+<number>#` | `##67#` |

**Ring Delay Configuration:**
```
**61*1<number>**<seconds>#
```
Available: 5, 10, 15, 20, 25, 30 seconds

Example for 10 seconds: `**61*18056377243**10#`

**Reset to default:** `##004#`

**Call control codes:**
| Code | Function |
|------|----------|
| `**43#` | Activate call waiting |
| `#43#` | Deactivate call waiting |
| `*671+<number>` | Block outgoing Caller ID (per call) |

---

### Verizon

**Enable Conditional Forwarding (No Answer/Busy):**
```
*71<10_digit_number>
```
Example: `*719085551234`

Phone rings first, forwards only if unanswered (3-4 rings).

**Enable Unconditional (all calls, no ring):**
```
*72<10_digit_number>
```

**Specific conditional types:**
| Type | Enable |
|------|--------|
| Busy only | `*90<number>` |
| No Answer only | `*92<number>` |

**Disable forwarding:**
```
*73
```
Works for both unconditional and conditional.

**Ring Delay:**
Verizon uses fixed delay (~3-4 rings). No MMI code adjustment available.

---

### Sprint (Now T-Mobile)

**Enable Unconditional Forwarding:**
```
*72<10_digit_number>
```
Press Talk/Call button. Listen for confirmation.

**Enable Conditional Forwarding:**
| Type | Enable | Disable |
|------|--------|---------|
| No Answer | `*73<number>` | `*730` |
| Busy | `*74<number>` | `*740` |
| Unreachable | `*71<number>` | `*710` |

**Disable Unconditional:** `*720`

**Note:** Sprint doesn't offer Selective Call Forwarding but does support Consecutive Call Forwarding (forward through sequence of numbers).

---

## All MMI Forwarding Codes Reference

### GSM Standard Codes (AT&T, T-Mobile, AU carriers)

| Code | Action |
|------|--------|
| `**21*<number>#` | Enable unconditional forwarding |
| `##21#` | Disable unconditional |
| `*#21#` | Check unconditional status |
| `**61*<number>#` | Enable no-answer forwarding |
| `##61#` | Disable no-answer |
| `*#61#` | Check no-answer status |
| `**62*<number>#` | Enable unreachable forwarding |
| `##62#` | Disable unreachable |
| `*#62#` | Check unreachable status |
| `**67*<number>#` | Enable busy forwarding |
| `##67#` | Disable busy |
| `*#67#` | Check busy status |
| `**004*<number>#` | Enable all conditional (61+62+67) |
| `##004#` | Disable all conditional |
| `##002#` | **Master disable - cancels ALL forwarding** |

### CDMA Codes (Verizon, Sprint legacy)

| Code | Action |
|------|--------|
| `*72<number>` | Enable all-call forwarding |
| `*73` | Disable all-call forwarding |
| `*71<number>` | Conditional (no answer/busy) |
| `*90<number>` | Busy only |
| `*92<number>` | No answer only |

---

## Ring Delay Configurations

### How Ring Delay Works
Ring delay = seconds phone rings before forwarding activates.
- Too short: Caller hears 1-2 rings, might think call dropped
- Too long: Caller waits forever, might hang up
- **Recommended: 10-15 seconds (3-4 rings)**

### Carrier Ring Delay Support

| Carrier | Default | Adjustable | Code Format |
|---------|---------|------------|-------------|
| Telstra | 15s | Yes (5-30s) | `**004*<num>*<seconds>#` |
| Optus | 10s | Yes | `*61*<num>**<seconds>#` |
| Vodafone AU | 15s | **No** | N/A |
| T-Mobile | 20s | Yes (5-30s) | `**61*<num>**<seconds>#` |
| AT&T | ~20s | Limited | Contact carrier |
| Verizon | 3-4 rings | **No** | Fixed |
| Sprint | ~20s | **No** | Fixed |

### Telstra Ring Time Code Examples
```
**61*101**15#   # 15 seconds
**61*101**20#   # 20 seconds
**61*101**25#   # 25 seconds
**61*101**30#   # 30 seconds (maximum)
```

### T-Mobile Ring Time Examples
```
**61*1<number>**5#    # 5 seconds
**61*1<number>**10#   # 10 seconds
**61*1<number>**15#   # 15 seconds
**61*1<number>**20#   # 20 seconds
**61*1<number>**25#   # 25 seconds
**61*1<number>**30#   # 30 seconds
```

---

## Disable/Re-enable Forwarding Codes

### Quick Disable (All Carriers)

**Universal GSM master disable:**
```
##002#
```
Cancels ALL active call diversions.

**Conditional-only disable:**
```
##004#
```
Cancels busy + no-answer + unreachable (keeps unconditional if set).

### Re-enable Forwarding

To re-enable, simply dial the original activation code again:
- AU Telstra: `**004*<agent_number>*10#`
- AU Others: `*004*<agent_number>#`
- US AT&T/T-Mobile: `**61*1<number>#` or `*004*1<number>#`
- US Verizon: `*71<number>`
- US Sprint: `*73<number>`

### Carrier-Specific Disable Codes

| Carrier | Disable All | Disable Conditional |
|---------|-------------|---------------------|
| Telstra | `##002#` | `##004#` |
| Optus | `##002#` | `##004#` |
| Vodafone AU | `##002#` | `##004#` |
| AT&T | `##002#` | `##004#` |
| T-Mobile | `##002#` | `##004#` |
| Verizon | `*73` | `*73` |
| Sprint | `*720` (unconditional), `*730` (no answer) | Individual codes |

---

## Dual SIM Caveats

### The Core Problem
When using dual SIM, the phone cannot use both SIMs simultaneously during a call. If you're on a call with SIM 1, SIM 2 is effectively disabled - callers to SIM 2 hear "unreachable" or go straight to voicemail.

### Setup Requirements

**Critical:** Select the correct SIM when setting up call forwarding!

**iPhone:**
1. Settings > Cellular > select the line to configure
2. Or when dialing MMI code, ensure correct line is selected
3. Settings > Phone > Call Forwarding shows which line is active

**Android:**
1. Phone app > Settings > Calling accounts
2. Select correct SIM (SIM 1 or SIM 2)
3. Call settings > Call forwarding > Configure for selected SIM

### Best Practices for Dual SIM

1. **Configure forwarding on BOTH SIMs** if you want Voqo to handle calls on both numbers
2. **Cross-forward between SIMs** as backup:
   - SIM 1 forwards to Voqo
   - SIM 2 forwards to Voqo (or to SIM 1 which then forwards to Voqo)
3. **Verify settings** by calling your number from another phone

### Common Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| Forwarding only works on one SIM | Configured wrong SIM | Check SIM selection in settings |
| "Unexpected response from network" | Network congestion | Reset network settings, retry |
| MMI code fails | Wrong SIM selected | Switch default line, retry |
| Calls going to carrier voicemail | Forwarding not active on that SIM | Verify with `*#61#` on each SIM |

### iPhone Dual SIM Specifics
- When on call with one line, incoming calls on other line go to voicemail (no missed-call notification on secondary)
- Set preferred line per contact: Contacts > tap contact > tap "default" > select line
- Forward all calls from one number to another to avoid missing calls during active calls

---

## Live Voicemail Caveats

### What is Live Voicemail?
iOS 17+ feature that transcribes voicemails in real-time on device, letting you "listen in" and optionally pick up.

### Conflicts with Call Forwarding

**Live Voicemail may interfere with:**
- Conditional call forwarding
- Voicemail-to-text (MMS)
- Carrier voicemail access (*86 on Verizon)
- Free voicemails when roaming

**Key issue:** Voicemails received when Live Voicemail is active may not be saved on carrier's system. On Verizon, messages won't be available by calling *86.

### How to Disable Live Voicemail

**iPhone (iOS 17+):**
1. Settings > Phone > Live Voicemail
2. Toggle OFF

When disabled:
- Callers prompted to leave voicemail via carrier system (not on-device)
- No real-time "listen in" prompt
- Voicemails appear in standard voicemail inbox

### Visual Voicemail Conflicts

**Call forwarding can break Visual Voicemail.**

Symptoms:
- VVM stops receiving new messages
- Voicemails don't appear in app
- "Unable to connect" errors

**Troubleshooting:**
1. Check that call forwarding is configured correctly (not forwarding to wrong number)
2. Reset call forwarding: `##004#` then reconfigure
3. Reset network settings: Settings > General > Transfer or Reset > Reset Network Settings
4. Contact carrier if VVM still broken

### Recommendations for Voqo Users

1. **Disable Live Voicemail** before setting up call forwarding
2. **Test thoroughly** after setup - call your number, verify it forwards to Voqo
3. **If using carrier voicemail as backup**, ensure conditional forwarding ring delay is appropriate
4. **Don't forward to voicemail AND Voqo** - choose one destination for unanswered calls

---

## Troubleshooting

### "Connection Problem or Invalid MMI Code"

**Common causes:**
1. Wrong carrier code format
2. Dual SIM - wrong line selected
3. Network congestion
4. Phone doesn't support the code

**Fixes:**
1. Try adding `+` after `*`: `*+004*...` instead of `*004*...`
2. Toggle airplane mode for 5 seconds, retry
3. Ensure mobile data ON, Wi-Fi calling OFF
4. Try alternative code format for your carrier
5. Some Samsung phones don't send correct commands - use carrier app/website instead

### Forwarding Not Working

1. Verify activation: dial `*#61#` to check status
2. Ensure you have cellular service and good signal during setup
3. iPhone: confirm Call Forwarding is OFF in Settings first
4. Dual SIM: verify correct SIM selected
5. Try `##002#` to clear all, then re-setup

### Calls Going to Carrier Voicemail Instead of Voqo

1. Carrier voicemail may have shorter ring time than your forwarding delay
2. Contact carrier to extend voicemail pickup time, OR
3. Reduce forwarding ring delay (e.g., 10 seconds instead of 15)
4. Disable carrier voicemail entirely if possible

---

## Quick Reference Card

### Australia Setup (Copy-Paste Ready)

**Telstra:**
```
**004*AGENT_NUMBER*10#
```

**Optus/Vodafone/TPG/Boost/Woolworths:**
```
*004*AGENT_NUMBER#
```

**Disable:**
```
##002#
```

### US Setup (Copy-Paste Ready)

**AT&T:**
```
*004*1AGENT_NUMBER#
```

**T-Mobile:**
```
**61*1AGENT_NUMBER#
```

**Verizon:**
```
*71AGENT_NUMBER
```

**Sprint:**
```
*73AGENT_NUMBER
```

**Disable (all US GSM):**
```
##002#
```

**Disable (Verizon/Sprint):**
```
*73
```

---

## Sources

- [Voqo AI Docs - Australia](https://docs.voqo.ai/connect-agent-au)
- [Voqo AI Docs - United States](https://docs.voqo.ai/connect-agent-us)
- [Voqo AI Docs - Overview](https://docs.voqo.ai/connect-agent-overview)
- [T-Mobile Self-Service Short Codes](https://www.t-mobile.com/support/plans-features/self-service-short-codes)
- [Verizon Call Forwarding FAQs](https://www.verizon.com/support/call-forwarding-faqs/)
- [Telstra Call Forwarding](https://www.telstra.com.au/support/mobiles-devices/messagebank-call-forwarding-ring-time)
- [Australian Call Forwarding Guide](https://www.trillet.ai/blogs/how-to-set-up-call-forwarding-in-australia)
