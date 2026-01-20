import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Validates if a phone number is in E.164 format
 * @param phone - Phone number to validate
 * @returns true if valid E.164 format
 */
export function isValidE164(phone: string): boolean {
  // E.164 format: +[country code][number]
  // Must start with +, followed by 1-15 digits
  const e164Regex = /^\+[1-9]\d{1,14}$/
  return e164Regex.test(phone)
}

/**
 * Formats a phone number to E.164 format
 * @param phone - Input phone number
 * @param defaultCountry - Default country code (default: 'AU' for +61)
 * @returns Formatted E.164 phone number
 */
export function formatPhoneE164(phone: string, defaultCountry: string = 'AU'): string {
  // Remove all non-digit characters except +
  let cleaned = phone.replace(/[^\d+]/g, '')

  // If already starts with +, return if valid
  if (cleaned.startsWith('+')) {
    return isValidE164(cleaned) ? cleaned : ''
  }

  // Handle country-specific formatting
  if (defaultCountry === 'AU') {
    // Australian numbers
    if (cleaned.startsWith('61')) {
      // Already has country code
      return '+' + cleaned
    } else if (cleaned.startsWith('0')) {
      // Remove leading 0 and add +61
      return '+61' + cleaned.slice(1)
    } else if (cleaned.length >= 9) {
      // Assume it's missing country code
      return '+61' + cleaned
    }
  }

  // For other countries or if can't format, return empty
  return ''
}

/**
 * Formats duration in seconds to human-readable format
 * @param seconds - Duration in seconds
 * @returns Formatted duration string (e.g., "2m 30s")
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`
  }

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  if (minutes < 60) {
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  let result = `${hours}h`
  if (remainingMinutes > 0) {
    result += ` ${remainingMinutes}m`
  }
  if (remainingSeconds > 0) {
    result += ` ${remainingSeconds}s`
  }

  return result
}

/**
 * Formats a date to human-readable format
 * @param date - Date to format (string or Date object)
 * @returns Formatted date string
 */
export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date

  if (isNaN(dateObj.getTime())) {
    return 'Invalid date'
  }

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
  const targetDate = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate())

  if (targetDate.getTime() === today.getTime()) {
    return `Today at ${format(dateObj, 'h:mm a')}`
  } else if (targetDate.getTime() === yesterday.getTime()) {
    return `Yesterday at ${format(dateObj, 'h:mm a')}`
  } else if (dateObj.getFullYear() === now.getFullYear()) {
    return format(dateObj, 'MMM d \'at\' h:mm a')
  } else {
    return format(dateObj, 'MMM d, yyyy \'at\' h:mm a')
  }
}

/**
 * Formats timestamp for transcript display
 * @param seconds - Timestamp in seconds
 * @returns Formatted timestamp string (e.g., "1:23")
 */
export function formatTimestamp(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

/**
 * Capitalizes the first letter of a string
 * @param str - String to capitalize
 * @returns Capitalized string
 */
export function capitalize(str: string): string {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * Truncates text to a maximum length
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text with ellipsis if needed
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + '...'
}

/**
 * Safely parses JSON with fallback
 * @param jsonString - JSON string to parse
 * @param fallback - Fallback value if parsing fails
 * @returns Parsed JSON or fallback value
 */
export function safeJsonParse<T>(jsonString: string, fallback: T): T {
  try {
    return JSON.parse(jsonString) as T
  } catch {
    return fallback
  }
}

/**
 * Generates a random ID (fallback if CUID2 fails)
 * @returns Random ID string
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}
