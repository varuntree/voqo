# Voqo AI Outbound Calling Features

Complete documentation for Individual and Batch Outbound Calling capabilities.

---

## Table of Contents

1. [Individual Outbound Call](#individual-outbound-call)
2. [Batch Outbound Calls System](#batch-outbound-calls-system)
   - [System Architecture](#system-architecture)
   - [Campaigns](#campaigns)
   - [Batch Uploads](#batch-uploads)
   - [Batch Contacts](#batch-contacts)
   - [Batch Jobs](#batch-jobs)
3. [Requirements & Constraints](#requirements--constraints)
   - [Phone Number Requirements](#phone-number-requirements)
   - [Concurrency Limits](#concurrency-limits)
   - [Manual Verification Requirement](#manual-verification-requirement)

---

## Individual Outbound Call

### Overview

Initiate one-off calls to any phone number directly from Voqo AI platform for personalized outreach and customer engagement.

### Workflow (7 Steps)

1. **Login** - Access Voqo AI dashboard
2. **Access Feature** - Click "Outbound Call" button (top right corner)
3. **Enter Number** - Input recipient's phone number
4. **Select Agent** - Choose your configured AI agent
5. **Select Caller ID** - Choose number to initiate call from
6. **Initiate Call** - Agent handles conversation per configured prompts/workflows
7. **Review Results** - Access call summary, transcript, and recording in call logs

### Use Cases

| Use Case | Description |
|----------|-------------|
| **Customer Follow-Up** | Post-purchase or interaction outreach |
| **Appointment Reminders** | Client notification for upcoming bookings |
| **Sales Outreach** | Prospect/lead targeting for campaigns |
| **Service Notifications** | Updates on renewals or important information |
| **Personalized Engagement** | Tailored messages for high-value clients |

---

## Batch Outbound Calls System

### System Architecture

Integrated dashboard managing multiple interconnected components for simultaneous initiation of multiple outbound calls using configured Voqo AI agents.

```
Campaign
    |
    v
Batch Upload (CSV/XLSX) --> Batch Contacts
    |
    v
Batch Job (Agent + Campaign + Upload + Phone Number)
    |
    v
Call Execution --> Reports
```

### Core Components

| Component | Purpose |
|-----------|---------|
| **Campaigns** | Organize/manage calling campaigns with tracking & analysis |
| **Batch Uploads** | Upload recipient lists (CSV/XLSX format) |
| **Batch Contacts** | View all contacts with dynamic parameters (read-only) |
| **Batch Jobs** | Monitor status, details, reporting, and call outcomes |

### High-Level Workflow

1. Access overview dashboard via sidebar navigation
2. Create new campaign defining call purposes and parameters
3. Upload recipient lists in supported file formats
4. Review and manage recipient information for accuracy
5. Create batch jobs by selecting agent, campaign, upload file, and phone number

---

## Campaigns

### Definition

A Campaign is an abstract grouping that maps to your real-world marketing or outreach initiatives for organizing batch outbound calls.

### Key Features

- Organize and manage batch outbound calling efforts
- Track progress and analyze results
- Monitor ongoing and past activities

### Campaign Management

#### View All Campaigns

Click the **Campaigns** button in navbar to see all created campaigns.

#### Create New Campaign

1. Click **"New Campaign"** button
2. Enter campaign name (required)
3. Submit

#### Edit Existing Campaign

1. Locate campaign row
2. Click action menu (three dots icon)
3. Select edit option
4. Modify campaign name
5. Save changes

---

## Batch Uploads

### File Format Requirements

| Requirement | Specification |
|-------------|---------------|
| **Format** | CSV or XLSX only |
| **Required Header** | `phone_number` (mandatory) |
| **Custom Headers** | Any additional columns as needed |

### Required vs Optional Headers

```
REQUIRED:
- phone_number

OPTIONAL (Dynamic Variables):
- name
- department
- job_position
- company
- [any custom field]
```

### Dynamic Variables

Headers beyond `phone_number` become dynamic variables for agent prompts. Enable personalization per contact.

**Example CSV Structure:**
```csv
phone_number,name,department,job_position,company
+14155551234,John Smith,Sales,Manager,Acme Corp
+14155555678,Jane Doe,Marketing,Director,TechCo
```

**Usage in Agent Prompts:**
- Variables accessible via their column header names
- Agent can reference `{name}`, `{department}`, `{job_position}`, etc.
- Enables customized conversations per contact

### Upload Process

1. Navigate to **Batch Uploads** in sidebar
2. Click **New/Add** from action menu
3. Enter upload name (recommend: match filename with extension, e.g., `list1.csv`)
4. Select and upload file from local system

### Metadata Displayed

- File name
- File size
- Total contact count

### Best Practices

| Practice | Reason |
|----------|--------|
| Use unique filenames | Avoid confusion |
| Match upload name to filename | Easy identification |
| Include relevant dynamic params | Maximize personalization |
| Verify data before upload | Ensure accuracy |

---

## Batch Contacts

### Overview

**Read-only reference interface** for viewing contacts included in batch outbound calling campaigns.

> "This page is designed for easy reference and review - no manual operations are required here."

### Data Displayed

- Phone number
- Dynamic parameters (name, department, job_position, etc.)
- All custom fields from original upload
- Complete recipient details

### Contact Origin

Contacts automatically created from Batch Upload process. Each row in uploaded CSV/XLSX becomes a Batch Contact entry.

### Purpose

- Verify recipient information accuracy
- Ensure data ready for personalized outreach
- Quality assurance before call execution

### Limitations

| Can Do | Cannot Do |
|--------|-----------|
| View all contacts | Edit contact data |
| Review dynamic params | Add new contacts |
| Verify accuracy | Delete contacts |
| | Modify fields |

To modify contacts: Re-upload corrected file via Batch Uploads.

---

## Batch Jobs

### Definition

A Batch Job is the final step in launching a batch outbound call campaign. It combines:
- Selected campaign
- AI agent
- Batch upload (contact list)
- Phone number

...to create and execute coordinated batch calling operation.

### Create Batch Job (7 Steps)

1. Click **"New Job"** button
2. Enter job name
3. Select agent to use
4. Choose campaign to associate
5. Select batch upload (contact list)
6. Select phone number to initiate calls
7. Launch job

### Job Management

#### Status Tracking

Monitor status of each running job via the **job status field**.

Typical statuses:
- Pending
- Running
- Paused
- Completed
- Failed/Error

#### Available Actions

Access via three-dot action menu on each job row:

| Action | Description |
|--------|-------------|
| **Add** | Create new job |
| **Edit** | Modify job configuration |
| **Delete** | Remove job |
| **Run** | Execute/start job |

### Reports

**Post-completion access:**

1. Job completes
2. Click **"View Logs"** option
3. Download detailed job report

**Report Contents:**
- Individual call outcomes
- Per-recipient details
- Timestamps
- Call durations
- Success/failure status

---

## Requirements & Constraints

### Phone Number Requirements

| Requirement | Details |
|-------------|---------|
| **Active Account** | Must have active Voqo AI account |
| **Configured Agent** | Minimum one AI agent configured |
| **Purchased Number** | Must have phone number purchased through Voqo |
| **Acquisition** | Via paid subscription OR add-on purchase |

**Note:** Cannot use external phone numbers. Must acquire through Voqo AI platform.

### Concurrency Limits

| Aspect | Details |
|--------|---------|
| **Definition** | Maximum simultaneous active calls |
| **Determination** | Based on supplier quotas |
| **How to Check** | Contact Voqo AI support |
| **Variability** | May vary by account/plan |

> Concurrent active call limits depend on supplier quotas; contact support for specific concurrency details.

### Manual Verification Requirement

Before launching batch operations:

1. **Campaign Verification**
   - Confirm campaign name/purpose correct
   - Verify campaign associations

2. **Upload Verification**
   - Check file format (CSV/XLSX)
   - Verify `phone_number` header present
   - Validate all phone numbers formatted correctly
   - Review dynamic variables/custom headers

3. **Contact Verification**
   - Review Batch Contacts page
   - Verify recipient information accuracy
   - Ensure data ready for personalized outreach
   - Check for duplicates/errors

4. **Job Configuration Verification**
   - Confirm correct agent selected
   - Verify campaign association
   - Check batch upload selection
   - Validate phone number (caller ID) selection

5. **Pre-Launch Checklist**
   - [ ] Campaign created and configured
   - [ ] File uploaded successfully
   - [ ] All contacts imported correctly
   - [ ] Dynamic variables mapped to agent prompts
   - [ ] Agent tested and working
   - [ ] Caller ID number valid and active

---

## Quick Reference

### Individual vs Batch Comparison

| Aspect | Individual | Batch |
|--------|------------|-------|
| **Volume** | Single call | Multiple simultaneous |
| **Setup** | Immediate | Requires campaign/upload setup |
| **Personalization** | Manual selection | Dynamic variables from CSV |
| **Use Case** | One-off outreach | Large-scale campaigns |
| **Tracking** | Call logs | Job reports |

### File Format Template

```csv
phone_number,name,company,appointment_date,custom_field
+14155551234,John Smith,Acme Corp,2024-01-15,value1
+14155555678,Jane Doe,TechCo,2024-01-16,value2
```

### Workflow Summary

```
1. Create Campaign
       |
       v
2. Upload CSV/XLSX (with phone_number + dynamic vars)
       |
       v
3. Verify Contacts (read-only check)
       |
       v
4. Create Batch Job (agent + campaign + upload + phone)
       |
       v
5. Execute & Monitor
       |
       v
6. Download Reports
```

---

## Sources

- https://docs.voqo.ai/individual-outbound-call
- https://docs.voqo.ai/batch-outbound-calls-overview
- https://docs.voqo.ai/campaigns-batch-outbound-calls
- https://docs.voqo.ai/uploads-batch-outbound-calls
- https://docs.voqo.ai/contacts-batch-outbound-calls
- https://docs.voqo.ai/jobs-batch-outbound-calls
