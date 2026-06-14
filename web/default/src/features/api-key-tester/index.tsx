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

import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Shield } from 'lucide-react'
import { PublicLayout } from '@/components/layout'
import { PageTransition } from '@/components/page-transition'
import { TestForm } from './components/test-form'
import { TestResults } from './components/test-results'
import { CurlCommand } from './components/curl-command'
import { SecurityNotice } from './components/security-notice'
import { TerminalGuide } from './components/terminal-guide'
import { Troubleshooting } from './components/troubleshooting'
import { Faq } from './components/faq'
import { buildTestRequest, extractTokensFromResponse, isValidResponse } from './lib/build-test-request'
import type { TestFormState, TestResult } from './types'

export function ApiKeyTester() {
  const { t } = useTranslation()
  const [result, setResult] = useState<TestResult | null>(null)
  const [formState, setFormState] = useState<TestFormState | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleTest = useCallback(
    async (state: TestFormState) => {
      setIsLoading(true)
      setFormState(state)
      setResult(null)

      const resolvedModel = state.model || state.customModel || 'gpt-3.5-turbo'
      const { endpointPath, requestBody, headers } = buildTestRequest(
        resolvedModel,
        state.protocol,
        state.prompt,
        state.apiKey
      )
      const url = state.apiAddress.replace(/\/$/, '') + endpointPath

      const startTime = performance.now()

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: requestBody,
        })

        const latencyMs = Math.round(performance.now() - startTime)
        const responseBody = await response.text()
        const truncatedBody = responseBody.length > 8192
          ? responseBody.slice(0, 8192) + '...'
          : responseBody
        const tokensUsed = extractTokensFromResponse(responseBody)
        const success = response.ok && isValidResponse(responseBody)
        const errorMessage = !response.ok
          ? `HTTP ${response.status} ${response.statusText}`
          : !isValidResponse(responseBody)
            ? t('Connection failed')
            : ''

        setResult({
          success,
          statusCode: response.status,
          latencyMs,
          tokensUsed,
          responseBody: truncatedBody,
          errorMessage,
          endpointPath,
          requestBody,
        })

        if (success) {
          toast.success(t('Connection successful'))
        }
      } catch (err: any) {
        const latencyMs = Math.round(performance.now() - startTime)
        setResult({
          success: false,
          statusCode: 0,
          latencyMs,
          tokensUsed: null,
          responseBody: '',
          errorMessage: err.message || t('Connection failed'),
          endpointPath,
          requestBody,
        })
        toast.error(err.message || t('Connection failed'))
      } finally {
        setIsLoading(false)
      }
    },
    [t]
  )

  return (
    <PublicLayout showMainContainer={false}>
      <PageTransition className='mx-auto w-full max-w-[960px] space-y-6 px-3 py-12 sm:px-6 sm:py-16 xl:px-8'>
        {/* Page title */}
        <div className='space-y-1'>
          <h1 className='text-2xl font-extrabold tracking-tight sm:text-3xl'>
            {t('API Key Tester')}
          </h1>
          <p className='text-muted-foreground flex items-center gap-1.5 text-sm'>
            <Shield className='h-4 w-4 text-emerald-500' />
            {t("100% Secure · We never store your data")}
          </p>
        </div>

        {/* Security notice */}
        <SecurityNotice />

        {/* Test form */}
        <TestForm onSubmit={handleTest} isLoading={isLoading} />

        {/* Results */}
        {result && <TestResults result={result} />}

        {/* Curl command */}
        {formState && <CurlCommand formState={formState} result={result} />}

        {/* Terminal guide */}
        <TerminalGuide />

        {/* Troubleshooting */}
        <Troubleshooting />

        {/* FAQ */}
        <Faq />
      </PageTransition>
    </PublicLayout>
  )
}
