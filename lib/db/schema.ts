import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";

// 1. Agents table - AI voice agent configurations
export const agents = sqliteTable("agents", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  name: text("name").notNull(),
  description: text("description"),
  systemPrompt: text("system_prompt").notNull(),
  template: text("template"), // 'property_sales', 'property_manager', 'custom'
  greetingMessage: text("greeting_message"),
  enabled: integer("enabled", { mode: "boolean" }).default(true),
  elevenlabsAgentId: text("elevenlabs_agent_id"),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
  updatedAt: text("updated_at").default("CURRENT_TIMESTAMP"),
});

// 2. Contacts table - Individual contact records
export const contacts = sqliteTable("contacts", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  name: text("name").notNull(),
  phone: text("phone").notNull().unique(), // E.164 format
  notes: text("notes"),
  tags: text("tags"), // JSON array
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
  updatedAt: text("updated_at").default("CURRENT_TIMESTAMP"),
}, (table) => ({
  phoneIdx: index("contacts_phone_idx").on(table.phone),
  nameIdx: index("contacts_name_idx").on(table.name),
}));

// 3. Memories table - Contact memory/preference storage
export const memories = sqliteTable("memories", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  contactId: text("contact_id").notNull().references(() => contacts.id),
  content: text("content").notNull(),
  source: text("source"), // 'auto' | 'manual'
  callId: text("call_id"), // references calls.id (nullable)
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
}, (table) => ({
  contactIdx: index("memories_contact_idx").on(table.contactId),
}));

// 4. Calls table - Call records from ElevenLabs
export const calls = sqliteTable("calls", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  agentId: text("agent_id").notNull().references(() => agents.id),
  contactId: text("contact_id").references(() => contacts.id), // nullable
  elevenlabsConversationId: text("elevenlabs_conversation_id").unique(),
  direction: text("direction").notNull(), // 'inbound' | 'outbound'
  status: text("status").notNull(), // 'completed' | 'failed' | 'no_answer'
  fromPhone: text("from_phone").notNull(), // E.164
  toPhone: text("to_phone").notNull(), // E.164
  summary: text("summary"),
  transcript: text("transcript"), // JSON array
  duration: integer("duration"), // seconds
  recordingUrl: text("recording_url"),
  recordingExpiresAt: text("recording_expires_at"),
  smsSent: integer("sms_sent", { mode: "boolean" }).default(false),
  smsSentAt: text("sms_sent_at"),
  startedAt: text("started_at"),
  endedAt: text("ended_at"),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
}, (table) => ({
  agentIdx: index("calls_agent_idx").on(table.agentId),
  contactIdx: index("calls_contact_idx").on(table.contactId),
  fromPhoneIdx: index("calls_from_phone_idx").on(table.fromPhone),
  createdAtIdx: index("calls_created_at_idx").on(table.createdAt),
  conversationIdx: index("calls_conversation_idx").on(table.elevenlabsConversationId),
}));

// 5. Campaigns table - Batch calling campaign container
export const campaigns = sqliteTable("campaigns", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
  updatedAt: text("updated_at").default("CURRENT_TIMESTAMP"),
});

// 6. Uploads table - CSV/file upload for batch contacts
export const uploads = sqliteTable("uploads", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  campaignId: text("campaign_id").notNull().references(() => campaigns.id),
  filename: text("filename").notNull(),
  totalRows: integer("total_rows").notNull(),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

// 7. Batch Contacts table - Individual contacts from upload file
export const batchContacts = sqliteTable("batch_contacts", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  uploadId: text("upload_id").notNull().references(() => uploads.id),
  phone: text("phone").notNull(), // E.164
  name: text("name"),
  variables: text("variables"), // JSON object for template substitution
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
}, (table) => ({
  uploadIdx: index("batch_contacts_upload_idx").on(table.uploadId),
}));

// 8. Jobs table - Batch calling job execution
export const jobs = sqliteTable("jobs", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  campaignId: text("campaign_id").notNull().references(() => campaigns.id),
  uploadId: text("upload_id").notNull().references(() => uploads.id),
  agentId: text("agent_id").notNull().references(() => agents.id),
  status: text("status").notNull(), // 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  totalCalls: integer("total_calls").default(0),
  completedCalls: integer("completed_calls").default(0),
  failedCalls: integer("failed_calls").default(0),
  startedAt: text("started_at"),
  finishedAt: text("finished_at"),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
}, (table) => ({
  campaignIdx: index("jobs_campaign_idx").on(table.campaignId),
  statusIdx: index("jobs_status_idx").on(table.status),
}));

// 9. Job Calls table - Individual call tracking within job
export const jobCalls = sqliteTable("job_calls", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  jobId: text("job_id").notNull().references(() => jobs.id),
  batchContactId: text("batch_contact_id").notNull().references(() => batchContacts.id),
  callId: text("call_id").references(() => calls.id), // nullable
  status: text("status").notNull(), // 'pending' | 'calling' | 'completed' | 'failed'
  errorMessage: text("error_message"),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
}, (table) => ({
  jobIdx: index("job_calls_job_idx").on(table.jobId),
}));

// 10. Custom Functions table - LLM-callable API integrations per agent
export const customFunctions = sqliteTable("custom_functions", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  agentId: text("agent_id").notNull().references(() => agents.id),
  name: text("name").notNull(),
  description: text("description").notNull(),
  endpoint: text("endpoint").notNull(),
  method: text("method").notNull(), // 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  headers: text("headers"), // JSON object
  authType: text("auth_type").default("none"), // 'none' | 'api_key' | 'bearer' | 'basic'
  authConfig: text("auth_config"), // JSON, encrypted
  parameters: text("parameters"), // JSON Schema
  responseMapping: text("response_mapping"), // JSON mapping rules
  timeout: integer("timeout").default(30), // seconds
  enabled: integer("enabled", { mode: "boolean" }).default(true),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
  updatedAt: text("updated_at").default("CURRENT_TIMESTAMP"),
}, (table) => ({
  agentIdx: index("custom_functions_agent_idx").on(table.agentId),
}));

// 11. Settings table - Global application settings
export const settings = sqliteTable("settings", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  key: text("key").notNull().unique(),
  value: text("value").notNull(), // JSON value
  updatedAt: text("updated_at").default("CURRENT_TIMESTAMP"),
});

// Relations for Drizzle ORM
export const agentsRelations = relations(agents, ({ many }) => ({
  calls: many(calls),
  jobs: many(jobs),
  customFunctions: many(customFunctions),
}));

export const contactsRelations = relations(contacts, ({ many }) => ({
  calls: many(calls),
  memories: many(memories),
}));

export const memoriesRelations = relations(memories, ({ one }) => ({
  contact: one(contacts, {
    fields: [memories.contactId],
    references: [contacts.id],
  }),
  call: one(calls, {
    fields: [memories.callId],
    references: [calls.id],
  }),
}));

export const callsRelations = relations(calls, ({ one, many }) => ({
  agent: one(agents, {
    fields: [calls.agentId],
    references: [agents.id],
  }),
  contact: one(contacts, {
    fields: [calls.contactId],
    references: [contacts.id],
  }),
  memories: many(memories),
  jobCalls: many(jobCalls),
}));

export const campaignsRelations = relations(campaigns, ({ many }) => ({
  uploads: many(uploads),
  jobs: many(jobs),
}));

export const uploadsRelations = relations(uploads, ({ one, many }) => ({
  campaign: one(campaigns, {
    fields: [uploads.campaignId],
    references: [campaigns.id],
  }),
  batchContacts: many(batchContacts),
  jobs: many(jobs),
}));

export const batchContactsRelations = relations(batchContacts, ({ one, many }) => ({
  upload: one(uploads, {
    fields: [batchContacts.uploadId],
    references: [uploads.id],
  }),
  jobCalls: many(jobCalls),
}));

export const jobsRelations = relations(jobs, ({ one, many }) => ({
  campaign: one(campaigns, {
    fields: [jobs.campaignId],
    references: [campaigns.id],
  }),
  upload: one(uploads, {
    fields: [jobs.uploadId],
    references: [uploads.id],
  }),
  agent: one(agents, {
    fields: [jobs.agentId],
    references: [agents.id],
  }),
  jobCalls: many(jobCalls),
}));

export const jobCallsRelations = relations(jobCalls, ({ one }) => ({
  job: one(jobs, {
    fields: [jobCalls.jobId],
    references: [jobs.id],
  }),
  batchContact: one(batchContacts, {
    fields: [jobCalls.batchContactId],
    references: [batchContacts.id],
  }),
  call: one(calls, {
    fields: [jobCalls.callId],
    references: [calls.id],
  }),
}));

export const customFunctionsRelations = relations(customFunctions, ({ one }) => ({
  agent: one(agents, {
    fields: [customFunctions.agentId],
    references: [agents.id],
  }),
}));