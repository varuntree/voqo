// ElevenLabs API response types

export interface ElevenLabsAgent {
  agent_id: string
  name: string
  prompt: {
    prompt: string
  }
  voice_id: string
  language: string
  max_duration?: number
  custom_llm_extra_body?: Record<string, any>
  custom_tools?: ElevenLabsTool[]
  conversation_config: {
    agent: {
      think_out_loud: boolean
      interrupt_sensitivity: number
    }
    asr: {
      optimize_streaming_latency: boolean
    }
    tts: {
      optimize_streaming_latency: boolean
      stability: number
      similarity_boost: number
    }
  }
  created_at: string
  last_used_at?: string
}

export interface ElevenLabsTool {
  name: string
  description: string
  parameters: {
    type: 'object'
    properties: Record<string, {
      type: string
      description?: string
    }>
    required?: string[]
  }
  url?: string
}

export interface CreateAgentRequest {
  name: string
  prompt: {
    prompt: string
  }
  voice_id: string
  language?: string
  max_duration?: number
  conversation_config?: {
    agent?: {
      think_out_loud?: boolean
      interrupt_sensitivity?: number
    }
    asr?: {
      optimize_streaming_latency?: boolean
    }
    tts?: {
      optimize_streaming_latency?: boolean
      stability?: number
      similarity_boost?: number
    }
  }
  custom_tools?: ElevenLabsTool[]
}

export interface UpdateAgentRequest {
  name?: string
  prompt?: {
    prompt: string
  }
  voice_id?: string
  language?: string
  max_duration?: number
  conversation_config?: {
    agent?: {
      think_out_loud?: boolean
      interrupt_sensitivity?: number
    }
    asr?: {
      optimize_streaming_latency?: boolean
    }
    tts?: {
      optimize_streaming_latency?: boolean
      stability?: number
      similarity_boost?: number
    }
  }
  custom_tools?: ElevenLabsTool[]
}

export interface OutboundCallRequest {
  agent_id: string
  customer_phone_number: string
  phone_number_id: string
  context?: string
  conversation_config_override?: {
    agent?: {
      think_out_loud?: boolean
      interrupt_sensitivity?: number
    }
    asr?: {
      optimize_streaming_latency?: boolean
    }
    tts?: {
      optimize_streaming_latency?: boolean
      stability?: number
      similarity_boost?: number
    }
  }
}

export interface OutboundCallResponse {
  conversation_id: string
}

export interface ElevenLabsConversation {
  conversation_id: string
  agent_id: string
  customer_phone_number: string
  phone_number_id: string
  status: 'queued' | 'ongoing' | 'ended' | 'failed'
  start_time: string
  end_time?: string
  transcript?: ElevenLabsTranscriptItem[]
  recording_url?: string
  summary?: string
  context?: string
  cost?: {
    characters: number
    amount_usd: number
  }
}

export interface ElevenLabsTranscriptItem {
  agent_id: string
  role: 'agent' | 'user'
  content: string
  start_time: number
  end_time: number
}

export interface ElevenLabsError {
  detail: {
    status: string
    message: string
  }
}

// Webhook payload types
export interface ElevenLabsWebhookEvent {
  event_type: 'post_call_transcription' | 'call_initiation_failure'
  conversation_id: string
  agent_id: string
  customer_phone_number: string
  phone_number_id: string
  timestamp: string
}

export interface PostCallTranscriptionEvent extends ElevenLabsWebhookEvent {
  event_type: 'post_call_transcription'
  transcript: ElevenLabsTranscriptItem[]
  recording_url?: string
  summary?: string
  status: 'completed' | 'no_answer'
  start_time: string
  end_time: string
  duration_ms: number
  cost?: {
    characters: number
    amount_usd: number
  }
}

export interface CallInitiationFailureEvent extends ElevenLabsWebhookEvent {
  event_type: 'call_initiation_failure'
  error_message: string
  failure_reason: string
}

export type ElevenLabsWebhookPayload = PostCallTranscriptionEvent | CallInitiationFailureEvent