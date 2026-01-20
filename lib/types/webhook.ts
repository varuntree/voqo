// Webhook payload types for external services

import { ElevenLabsWebhookPayload } from './elevenlabs'

// Webhook verification types
export interface WebhookVerification {
  isValid: boolean
  error?: string
}

// Webhook processing result
export interface WebhookProcessingResult {
  success: boolean
  callId?: string
  contactId?: string
  error?: string
  message?: string
}

// Webhook handler context
export interface WebhookContext {
  headers: Record<string, string>
  body: string
  signature?: string
  timestamp?: string
}

// ElevenLabs webhook types (re-exported for convenience)
export type { ElevenLabsWebhookPayload } from './elevenlabs'

// Custom function execution webhook (when agent calls external API)
export interface FunctionExecutionRequest {
  function_name: string
  agent_id: string
  conversation_id: string
  parameters: Record<string, any>
  context?: {
    caller_phone?: string
    caller_name?: string
    call_summary?: string
  }
}

export interface FunctionExecutionResponse {
  success: boolean
  data?: any
  error?: string
  message?: string
}

// Twilio webhook types (if we need to handle Twilio events directly)
export interface TwilioWebhookEvent {
  AccountSid: string
  MessageSid?: string
  CallSid?: string
  From: string
  To: string
  Body?: string
  CallStatus?: 'queued' | 'ringing' | 'in-progress' | 'completed' | 'busy' | 'failed' | 'no-answer'
  CallDuration?: string
  RecordingUrl?: string
  Timestamp: string
}

// Generic webhook event wrapper
export interface WebhookEvent<T = any> {
  id: string
  type: string
  source: 'elevenlabs' | 'twilio' | 'custom'
  timestamp: string
  data: T
  processed: boolean
  error?: string
}