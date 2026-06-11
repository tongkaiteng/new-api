/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import { z } from 'zod'

export const freeTokenSitePublicSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  site_url: z.string(),
  logo_url: z.string(),
  bonus: z.string(),
  sort_order: z.number(),
  total_count: z.number(),
  available_count: z.number(),
  claimed_count: z.number(),
  created_time: z.number(),
  claimed: z.boolean(),
  code: z.string().optional(),
})

export type FreeTokenSitePublic = z.infer<typeof freeTokenSitePublicSchema>

export const freeTokenClaimRecordSchema = z.object({
  id: z.number(),
  site_id: z.number(),
  site_name: z.string(),
  site_url: z.string(),
  logo_url: z.string(),
  bonus: z.string(),
  code: z.string(),
  claimed_time: z.number(),
})

export type FreeTokenClaimRecord = z.infer<typeof freeTokenClaimRecordSchema>

export type ApiResponse<T = unknown> = {
  success: boolean
  message?: string
  data?: T
}

export type ClaimFreeTokenResponse = FreeTokenClaimRecord

export const freeApiKeySchema = z.object({
  id: z.number(),
  user_id: z.number(),
  username: z.string(),
  api_address: z.string(),
  protocol: z.number(),
  api_key: z.string(),
  models: z.string(),
  note: z.string(),
  claim_count: z.number(),
  claim_cost: z.number(),
  claimed: z.boolean(),
  claimed_time: z.number().optional(),
  created_time: z.number(),
})

export type FreeApiKey = z.infer<typeof freeApiKeySchema>

export type FreeApiKeySubmitPayload = {
  api_address: string
  protocol: number
  api_key: string
  models: string
  note: string
}

export const PROTOCOL_OPTIONS = [
  { value: 1, key: 'OpenAI v1' },
  { value: 2, key: 'Anthropic Message' },
  { value: 3, key: 'Gemini' },
  { value: 4, key: 'Custom' },
] as const

export const COMMON_MODELS = [
  'gpt-4o',
  'gpt-4o-mini',
  'gpt-4.1',
  'claude-sonnet-4-6',
  'claude-haiku-4-5',
  'gemini-2.5-flash',
  'gemini-2.5-pro',
  'deepseek-v3',
  'deepseek-r1',
] as const
