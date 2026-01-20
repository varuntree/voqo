# Voqo AI Agent Settings Documentation

## Overview

Agent Settings enables customization of AI voice agents with personality and operational parameters. Users can create multiple agents for different business needs (inbound calls, outbound campaigns, specific departments).

---

## 1. General Settings

### Agent Name
- **Field**: Text input
- **Purpose**: Customize agent's identity/display name

### Agent Voice
- **Options**: 6 voices available (male and female collection)
- **Purpose**: Select voice personality for the agent

### Enable/Disable Toggle
- **Type**: Boolean toggle
- **Default**: Enabled
- **Behavior when disabled**: Agent will not respond to incoming calls

---

## 2. Advanced Settings

Access: Agents tab > Agent Settings > Advanced

### AI LLM Model Selection
- **Purpose**: Choose underlying language model
- **Options**: Not specified in docs (likely includes GPT variants)

### Timezone Configuration
- **Purpose**: Set agent's temporal context for time-aware responses

### Background Ambient Noise
- **Options**:
  - N/A (no ambient noise)
  - Office (with preview audio available)
- **Purpose**: Make conversation sound more natural

### Call Recording
- **Type**: Toggle
- **Availability**: Paid plans only
- **Retention**: 6 months from recording date
- **Note**: Download recordings before auto-deletion

### Interruptible
- **Type**: Toggle
- **Purpose**: Determine if callers can interrupt agent mid-speech

### Speech Speed
- **Purpose**: Adjust how quickly agent speaks
- **Options**: Variable speed control

### Specialized Keywords
- **Type**: Text input (domain-specific terminology)
- **Purpose**: Improved agent transcription and understanding of caller's speech
- **Use case**: Industry jargon, proper nouns, technical terms

---

## 3. Conversation Prompts

Access: Agent Settings > Conversation Settings tab

### Prompt Templates

Three preset templates available with customizable fields:

| Field | Description |
|-------|-------------|
| Agent name | Name the AI uses to identify itself |
| Human name | Your name (business representative) |
| AI agent opening sentence | Greeting repeated on every call |

#### Template Types:
1. **Default Receptionist** - General reception/front desk handling
2. **Property Agent** - Real estate/property management focused
3. **Custom** - Full control over all prompt aspects

### Custom Prompts Section

Full control over:

| Setting | Description |
|---------|-------------|
| Opening sentence | Initial greeting agent uses |
| Conversation flow | Full instructions governing call handling |
| Dynamic sentences | Option to generate unique opening lines per call |
| Contact integration | Include caller names if pre-configured in Contacts |

---

## 4. Magic Prompt Refiner

### Purpose
Automated tool that generates and refines effective prompts without manual experimentation.

### Complete 3-Step Flow

#### Step 1: Initial Prompt Submission
1. Navigate to Custom Prompt tab in Conversation Settings
2. Write basic instruction (perfection not required)
3. Describe agent's primary objective
4. Click **Refine** button

#### Step 2: AI Analysis & Detail Collection
1. System analyzes submitted prompt
2. System requests specific information to improve prompt
3. User fills in provided fields with detailed responses
4. More specificity = better results
5. Click **Submit & Refine**

#### Step 3: Review & Implementation
1. Tool generates professionally structured prompt
2. Incorporates prompt engineering best practices
3. Changes highlighted in **green** for easy review
4. User options:
   - **Accept changes** - Save refined prompt
   - **Discard** - Restart process

### Key Capabilities
- Transforms simple ideas into detailed, high-quality prompts
- Incorporates established prompt engineering best practices
- Provides guidance throughout process
- Ensures agents behave exactly as intended
- Systematically expands initial concepts into comprehensive instructions

---

## Configuration Summary

| Category | Settings Count | Location |
|----------|---------------|----------|
| General | 3 | Agent Settings main |
| Advanced | 7 | Agent Settings > Advanced |
| Prompts | 4+ fields | Agent Settings > Conversation Settings |
| Refiner | 3-step flow | Conversation Settings > Custom Prompt |

---

## Quick Reference: All Configurable Fields

### General Settings
- [ ] Agent Name (text)
- [ ] Agent Voice (6 options)
- [ ] Enable/Disable (toggle)

### Advanced Settings
- [ ] AI LLM Model (dropdown)
- [ ] Timezone (dropdown)
- [ ] Ambient Noise (N/A, Office)
- [ ] Call Recording (toggle, paid only)
- [ ] Interruptible (toggle)
- [ ] Speech Speed (slider/dropdown)
- [ ] Keywords (text input)

### Conversation Settings
- [ ] Template selection (3 presets)
- [ ] Agent name (text)
- [ ] Human name (text)
- [ ] Opening sentence (text)
- [ ] Conversation flow (text area)
- [ ] Dynamic sentences (toggle)
- [ ] Contact integration (toggle/config)

---

## Notes

- Call recordings retained 6 months only - download before deletion
- Multiple agents supported per account
- Keywords improve transcription accuracy for domain-specific terms
- Magic Prompt Refiner accessible for users unfamiliar with prompt engineering
