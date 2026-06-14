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

import { buildTestRequest } from './build-test-request'
import type { TestFormState } from '../types'

export function generateCurl(formState: TestFormState): string {
  const resolvedModel = formState.model || formState.customModel || 'gpt-3.5-turbo'
  const { endpointPath, requestBody, headers } = buildTestRequest(
    resolvedModel,
    formState.protocol,
    formState.prompt,
    'YOUR_API_KEY'
  )
  const url = formState.apiAddress.replace(/\/$/, '') + endpointPath

  const headerLines = Object.entries(headers)
    .filter(([k]) => k !== 'content-type' && k !== 'Content-Type')
    .map(([k, v]) => `  -H "${k}: ${v}"`)
    .join(' \\\n')

  const bodyPreview =
    requestBody.length <= 500
      ? requestBody
      : requestBody.slice(0, 497) + '...'

  return `curl -X POST "${url}" \\
  -H "Content-Type: application/json" \\
${headerLines} \\
  -d '${bodyPreview}'`
}

export function generateCurlFromResult(
  formState: TestFormState,
  requestBody: string
): string {
  const resolvedModel = formState.model || formState.customModel || 'gpt-3.5-turbo'
  const { endpointPath, headers } = buildTestRequest(
    resolvedModel,
    formState.protocol,
    formState.prompt,
    'YOUR_API_KEY'
  )
  const url = formState.apiAddress.replace(/\/$/, '') + endpointPath

  const headerLines = Object.entries(headers)
    .filter(([k]) => k !== 'content-type' && k !== 'Content-Type')
    .map(([k, v]) => `  -H "${k}: ${v}"`)
    .join(' \\\n')

  const bodyPreview =
    requestBody.length <= 500
      ? requestBody
      : requestBody.slice(0, 497) + '...'

  return `curl -X POST "${url}" \\
  -H "Content-Type: application/json" \\
${headerLines} \\
  -d '${bodyPreview}'`
}
