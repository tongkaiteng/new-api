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

export const FREE_API_KEY_STATUS = {
  UNTESTED: 0,
  AVAILABLE: 1,
  UNAVAILABLE: 2,
} as const

export const FREE_API_KEY_PROTOCOL = {
  OPENAI: 1,
  ANTHROPIC: 2,
  GEMINI: 3,
  CUSTOM: 4,
} as const

export const PROTOCOL_OPTIONS = [
  { value: 1, label: 'OpenAI v1' },
  { value: 2, label: 'Anthropic Message' },
  { value: 3, label: 'Gemini' },
  { value: 4, label: 'Custom' },
] as const

export const STATUS_OPTIONS = [
  { value: 0, label: 'Untested' },
  { value: 1, label: 'Available' },
  { value: 2, label: 'Unavailable' },
] as const

export const freeApiKeyAdminSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  username: z.string(),
  api_address: z.string(),
  protocol: z.number(),
  api_key: z.string(),
  models: z.string(),
  note: z.string(),
  claim_count: z.number(),
  status: z.number(),
  test_time: z.number(),
  created_time: z.number(),
  updated_time: z.number(),
})

export type FreeApiKeyAdmin = z.infer<typeof freeApiKeyAdminSchema>

export type ApiResponse<T = unknown> = {
  success: boolean
  message?: string
  data?: T
}

export type GetFreeApiKeysAdminResponse = ApiResponse<{
  items: FreeApiKeyAdmin[]
  total: number
  page: number
  page_size: number
}>

export type FreeApiKeyAdminDialogType = 'view' | 'status' | 'delete'
