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

export const PROTOCOL = {
  OPENAI: 1,
  ANTHROPIC: 2,
  GEMINI: 3,
} as const

export interface ProtocolOption {
  value: number
  label: string
}

export const PROTOCOL_OPTIONS: ProtocolOption[] = [
  { value: PROTOCOL.OPENAI, label: 'OpenAI v1' },
  { value: PROTOCOL.ANTHROPIC, label: 'Anthropic Messages' },
  { value: PROTOCOL.GEMINI, label: 'Gemini' },
]

export const PRESET_MODELS: string[] = [
  'claude-opus-4-8',
  'claude-sonnet-4-6',
  'claude-fable-5',
  'gpt-5.5',
  'gpt-5.4',
  'gpt-image-2',
  'gemini-3.1-pro-preview',
  'gemini-3.5-flash',
  'deepseek-v4-pro',
  'qwen3.7-max',
]

export interface TestFormState {
  apiAddress: string
  apiKey: string
  model: string
  customModel: string
  protocol: number
  prompt: string
}

export interface TestResult {
  success: boolean
  statusCode: number
  latencyMs: number
  tokensUsed: number | null
  responseBody: string
  errorMessage: string
  endpointPath: string
  requestBody: string
}
