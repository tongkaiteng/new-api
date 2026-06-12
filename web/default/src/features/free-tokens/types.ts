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
  status: z.number().optional(),
  test_time: z.number().optional(),
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
  // { value: 4, key: 'Custom' },
] as const

export interface ModelOption {
  id: string
  title: string
  provider: string
}

export const MODEL_OPTIONS: ModelOption[] = [
  { id: 'gemini-3.5-flash', title: 'Gemini 3.5 Flash', provider: 'Google' },
  { id: 'gpt-image-2', title: 'GPT Image 2', provider: 'OpenAI' },
  { id: 'gemini-3.1-pro', title: 'Gemini 3.1 Pro Preview', provider: 'Google' },
  { id: 'qwen3.7-max', title: 'Qwen3.7 Max', provider: 'Alibaba' },
  { id: 'gemini-3.1-pro-preview', title: 'Gemini 3.1 Pro', provider: 'Google' },
  { id: 'deepseek-v4-pro', title: 'DeepSeek V4 Pro', provider: 'DeepSeek' },
  { id: 'deepseek-v4-flash', title: 'DeepSeek V4 Flash', provider: 'DeepSeek' },
  { id: 'glm-5.1', title: 'GLM 5.1', provider: '智谱' },
  { id: 'kimi-k2.6', title: 'Kimi 2.6', provider: 'Moonshot AI' },
  { id: 'minimax-m2.7', title: 'MiniMax M2.7', provider: 'MiniMax' },
  { id: 'doubao-seedance-2-0-260128', title: 'Seedance 2.0', provider: 'ByteDance' },
  { id: 'happyhorse-1.0', title: 'happyhorse-1.0', provider: 'Alibaba-ATH' },
  { id: 'gemini-3.1-flash-image-preview', title: 'NanoBanana 2', provider: 'Google' },
  { id: 'seedance-2.0', title: 'seedance-2.0', provider: 'Bytedance' },
  { id: 'veo-3.1-audio', title: 'veo-3.1-audio', provider: 'Google' },
  { id: 'claude-opus-4-6', title: 'Claude Opus 4.6', provider: 'Anthropic' },
  { id: 'claude-opus-4-7', title: 'Claude Opus 4.7', provider: 'Anthropic' },
  { id: 'claude-opus-4-8', title: 'Claude Opus 4.8', provider: 'Anthropic' },
  { id: 'claude-sonnet-4-6', title: 'Claude Sonnet 4.6', provider: 'Anthropic' },
  { id: 'gpt-5.4', title: 'GPT 5.4', provider: 'OpenAI' },
  { id: 'gpt-5.5', title: 'GPT 5.5', provider: 'OpenAI' },
  { id: 'claude-fable-5', title: 'Claude Fable 5', provider: 'Anthropic' },
  { id: 'gemini-3.1-flash-image-preview-nano-banana-2', title: 'gemini-3.1-flash-image-preview (nano-banana-2)', provider: 'Google' },
  { id: 'gemini-3-pro-image-preview-2k-nano-banana-pro', title: 'gemini-3-pro-image-preview-2k (nano-banana-pro)', provider: 'Google' },
  { id: 'gemini-3-pro-image-preview-nano-banana-pro', title: 'gemini-3-pro-image-preview (nano-banana-pro)', provider: 'Google' },
  { id: 'grok-imagine-image', title: 'grok-imagine-image', provider: 'xAI' },
  { id: 'grok-video-3', title: 'grok-video-3', provider: 'xAI' },
  { id: 'mimo-v2.5', title: 'mimo-v2.5', provider: 'Xiaomi' },
  { id: 'mimo-v2.5-pro', title: 'mimo-v2.5-pro', provider: 'Xiaomi' },
  { id: 'minimax-m3', title: 'MiniMax M3', provider: 'MiniMax' },
  { id: 'qwen3.6-max-preview', title: 'Qwen3.6 Max', provider: 'Alibaba' },
  { id: 'qwen3.6-plus', title: 'Qwen3.6 plus', provider: 'Alibaba' },
  { id: 'seedance-1.5-pro', title: 'seedance-1.5-pro', provider: 'Bytedance' },
  { id: 'veo-3.1-audio-1080p', title: 'veo-3.1-audio-1080p', provider: 'Google' },
  { id: 'veo-3.1-fast-audio', title: 'veo-3.1-fast-audio', provider: 'Google' },
  { id: 'doubao-seedance-2-0-fast', title: 'Seedance 2.0 Fast', provider: 'ByteDance' },
]
