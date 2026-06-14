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

import { PROTOCOL } from '../types'

export interface TestRequestConfig {
  endpointPath: string
  requestBody: string
  headers: Record<string, string>
}

function detectEndpoint(model: string): string {
  const lower = model.toLowerCase()
  if (lower.includes('rerank')) return '/v1/rerank'
  if (lower.includes('embedding') || lower.startsWith('m3e') || lower.includes('bge-') || lower.includes('embed'))
    return '/v1/embeddings'
  if (lower.includes('seedream') || lower.includes('dall-e'))
    return '/v1/images/generations'
  if (lower.includes('codex')) return '/v1/responses'
  return '/v1/chat/completions'
}

function buildChatBody(model: string, prompt: string): string {
  const maxTokens = 16
  return JSON.stringify({
    model,
    stream: false,
    messages: [{ role: 'user', content: prompt || 'hi' }],
    max_tokens: maxTokens,
  })
}

function buildRerankBody(model: string): string {
  return JSON.stringify({
    model,
    query: 'What is Deep Learning?',
    documents: [
      'Deep Learning is a subset of machine learning.',
      'Machine learning is a field of artificial intelligence.',
    ],
    top_n: 2,
  })
}

function buildEmbeddingBody(model: string): string {
  return JSON.stringify({ model, input: ['hello world'] })
}

function buildImageBody(model: string): string {
  return JSON.stringify({
    model,
    prompt: 'a cute cat',
    n: 1,
    size: '1024x1024',
  })
}

function buildResponsesBody(model: string, prompt: string): string {
  return JSON.stringify({
    model,
    input: [{ role: 'user', content: prompt || 'hi' }],
  })
}

export function buildTestRequest(
  model: string,
  protocol: number,
  prompt: string,
  apiKey: string
): TestRequestConfig {
  const resolvedModel = model || 'gpt-3.5-turbo'
  let endpointPath: string
  let requestBody: string
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (protocol === PROTOCOL.ANTHROPIC) {
    endpointPath = '/v1/messages'
    requestBody = JSON.stringify({
      model: resolvedModel,
      stream: false,
      messages: [{ role: 'user', content: prompt || 'hi' }],
      max_tokens: 16,
    })
    headers['x-api-key'] = apiKey
    headers['anthropic-version'] = '2023-06-01'
  } else if (protocol === PROTOCOL.GEMINI) {
    endpointPath = `/v1beta/models/${resolvedModel}:generateContent`
    requestBody = JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt || 'hi' }],
        },
      ],
    })
    headers['x-goog-api-key'] = apiKey
  } else {
    // OpenAI v1 (default) — auto-detect endpoint from model
    endpointPath = detectEndpoint(resolvedModel)
    headers['Authorization'] = `Bearer ${apiKey}`
    if (endpointPath === '/v1/rerank') {
      requestBody = buildRerankBody(resolvedModel)
    } else if (endpointPath === '/v1/embeddings') {
      requestBody = buildEmbeddingBody(resolvedModel)
    } else if (endpointPath === '/v1/images/generations') {
      requestBody = buildImageBody(resolvedModel)
    } else if (endpointPath === '/v1/responses') {
      requestBody = buildResponsesBody(resolvedModel, prompt)
    } else {
      requestBody = buildChatBody(resolvedModel, prompt)
    }
  }

  return { endpointPath, requestBody, headers }
}

export function extractTokensFromResponse(body: string): number | null {
  try {
    const data = JSON.parse(body)
    if (data.usage?.total_tokens) return data.usage.total_tokens
    if (data.usageMetadata?.totalTokenCount) return data.usageMetadata.totalTokenCount
    return null
  } catch {
    return null
  }
}

export function isValidResponse(body: string): boolean {
  try {
    const data = JSON.parse(body)
    return !!(
      data.choices ||
      data.content ||
      data.data ||
      data.results ||
      data.candidates ||
      data.output ||
      data.type === 'message'
    )
  } catch {
    return false
  }
}
