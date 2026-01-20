# Voqo AI: Contacts & Memories

## Contacts

### Contact Fields

| Field | Required | Notes |
|-------|----------|-------|
| Name | Yes (import) | Required for batch import |
| Phone Number | Yes (import) | E.164 format required (Australian numbers exempt) |
| Additional Details | No | Available when adding manually |

### Multiple Phone Numbers - Priority Behavior

When contact has multiple numbers, system stores **one** using priority:

```
CELL > MOBILE > MAIN > WORK > HOME > OTHER
```

Only highest-priority number retained per contact.

### Batch Import (vCard/VCF)

**Steps:**
1. Sidebar → Contacts
2. Click "Add Contact"
3. Select "Batch Upload"
4. Upload/drag-drop vCard/VCF file
5. Review + edit in preview
6. Click "Import Contacts"

**Requirements:**
- Valid vCard/VCF format
- Each entry needs: name + phone
- E.164 phone format (Australian exempt)
- Duplicates auto-removed (same phone) → keeps alphabetically-first entry

### Contact Search/Filtering

Contacts searchable via sidebar. System matches callers to contacts during calls.

### Automatic Contact Features

**Automatic contact creation:**
- Creates contact when caller name identified during conversation
- Required for memories to work with new callers

**Automatic contact name update:**
- Refreshes name if subsequent calls provide different info

### Contact Integration Points

- Contact name appears in post-call SMS (below phone number)
- Memories tied to specific contacts
- Dynamic opening sentences can include contact name via custom prompts

---

## Memories System

### What Memories Are

Caller-specific information retained across conversations:
- Names
- Preferences
- Past requests
- Any facts extracted from calls

### Per-Contact Storage

Memories **saved and retrieved per Contact** - not global, not per-phone-number.

### Configuration Toggles

Located in Memory Settings:

| Toggle | Function |
|--------|----------|
| **Save conversation memories** | Extracts + stores new/updated caller facts post-call |
| **Use conversation memories** | Retrieves relevant memories during calls for personalization |

Both independent - can enable one without other.

### Paid-Only Restriction

**Memories available on paid plans only.**

### Automatic Contact Creation Requirement

For memories to function, caller must either:
1. Match existing Contact, OR
2. User enabled "Automatic contact creation" in Contact Settings

**Recommended:** Enable both "Automatic Contact Creation" + "Save conversation memories" together.

### How Memories Work

**Saving Phase (post-call):**
1. Call transcript analyzed
2. Caller-specific facts extracted
3. Saved as long-term memories scoped to Contact

**Usage Phase (during call):**
1. Caller matched to Contact
2. Relevant memories retrieved
3. Agent uses as internal context
4. **Memories NOT read aloud** to callers

### Viewing & Managing Memories

Path: Contacts → select Contact → "Long-term Memories" section

Shows:
- Stored information
- Last-updated timestamps

### How Memories Connect to Personalization

1. **Faster task completion** - agent already knows preferences
2. **Contextual responses** - references past interactions without re-asking
3. **Name usage** - greets caller by name
4. **Preference recall** - remembers stated preferences (e.g., delivery instructions, communication style)
5. **Continuity** - picks up where previous conversations left off

Memories become invisible context layer - enhances conversation quality without explicit "I remember you said..."
