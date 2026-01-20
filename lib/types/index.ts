// Shared TypeScript types for Voqo application

export type AgentTemplate = 'property_sales' | 'property_manager' | 'custom'

export type CallDirection = 'inbound' | 'outbound'

export type CallStatus = 'completed' | 'failed' | 'no_answer'

export type JobStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'

export type JobCallStatus = 'pending' | 'calling' | 'completed' | 'failed'

export type MemorySource = 'auto' | 'manual'

export type AuthType = 'none' | 'api_key' | 'bearer' | 'basic'

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

// Base entity types (matching database schema)
export interface Agent {
  id: string
  name: string
  description?: string
  systemPrompt: string
  template?: AgentTemplate
  greetingMessage?: string
  enabled: boolean
  elevenlabsAgentId?: string
  createdAt: string
  updatedAt: string
}

export interface Contact {
  id: string
  name: string
  phone: string // E.164 format
  notes?: string
  tags?: string // JSON array
  createdAt: string
  updatedAt: string
}

export interface Memory {
  id: string
  contactId: string
  content: string
  source?: MemorySource
  callId?: string
  createdAt: string
}

export interface Call {
  id: string
  agentId: string
  contactId?: string
  elevenlabsConversationId?: string
  direction: CallDirection
  status: CallStatus
  fromPhone: string // E.164
  toPhone: string // E.164
  summary?: string
  transcript?: string // JSON array
  duration?: number // seconds
  recordingUrl?: string
  recordingExpiresAt?: string
  smsSent: boolean
  smsSentAt?: string
  startedAt?: string
  endedAt?: string
  createdAt: string
}

export interface Campaign {
  id: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
}

export interface Upload {
  id: string
  campaignId: string
  filename: string
  totalRows: number
  createdAt: string
}

export interface BatchContact {
  id: string
  uploadId: string
  phone: string // E.164
  name?: string
  variables?: string // JSON object
  createdAt: string
}

export interface Job {
  id: string
  campaignId: string
  uploadId: string
  agentId: string
  status: JobStatus
  totalCalls: number
  completedCalls: number
  failedCalls: number
  startedAt?: string
  finishedAt?: string
  createdAt: string
}

export interface JobCall {
  id: string
  jobId: string
  batchContactId: string
  callId?: string
  status: JobCallStatus
  errorMessage?: string
  createdAt: string
}

export interface CustomFunction {
  id: string
  agentId: string
  name: string
  description: string
  endpoint: string
  method: HttpMethod
  headers?: string // JSON object
  authType: AuthType
  authConfig?: string // JSON, encrypted
  parameters?: string // JSON Schema
  responseMapping?: string // JSON mapping rules
  timeout: number // seconds
  enabled: boolean
  createdAt: string
  updatedAt: string
}

export interface Setting {
  id: string
  key: string
  value: string // JSON value
  updatedAt: string
}

// Extended types with relations
export interface AgentWithRelations extends Agent {
  calls?: Call[]
  jobs?: Job[]
  customFunctions?: CustomFunction[]
}

export interface ContactWithRelations extends Contact {
  calls?: Call[]
  memories?: Memory[]
  _count?: {
    calls: number
    memories: number
  }
}

export interface CallWithRelations extends Call {
  agent?: Agent
  contact?: Contact
  memories?: Memory[]
}

export interface CampaignWithRelations extends Campaign {
  uploads?: Upload[]
  jobs?: Job[]
  _count?: {
    uploads: number
    jobs: number
  }
}

export interface JobWithRelations extends Job {
  campaign?: Campaign
  upload?: Upload
  agent?: Agent
  jobCalls?: JobCall[]
  _count?: {
    jobCalls: number
  }
}

// Parsed JSON types
export interface ContactTags {
  tags: string[]
}

export interface CallTranscript {
  transcript: Array<{
    role: 'agent' | 'human'
    content: string
    timestamp?: number
  }>
}

export interface BatchContactVariables {
  [key: string]: string | number | boolean
}

export interface FunctionHeaders {
  [key: string]: string
}

export interface FunctionAuthConfig {
  apiKey?: string
  token?: string
  username?: string
  password?: string
}

export interface FunctionParameters {
  type: 'object'
  properties: {
    [key: string]: {
      type: string
      description?: string
      required?: boolean
    }
  }
  required?: string[]
}

export interface FunctionResponseMapping {
  [outputField: string]: string // JSONPath expression
}

// Application settings types
export interface AppSettings {
  sms_template: string
  sms_enabled: boolean
  sms_skip_silent: boolean
  auto_create_contacts: boolean
  save_memories: boolean
}

// API response types
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

// Form data types
export interface CreateAgentData {
  name: string
  description?: string
  template: AgentTemplate
  systemPrompt: string
  greetingMessage?: string
  enabled: boolean
}

export interface CreateContactData {
  name: string
  phone: string
  notes?: string
  tags?: string[]
}

export interface CreateMemoryData {
  contactId: string
  content: string
  source: MemorySource
}

export interface CreateCampaignData {
  name: string
  description?: string
}

export interface OutboundCallData {
  agentId: string
  phone: string
  contactId?: string
}

export interface SendSmsData {
  phone: string
  message: string
}