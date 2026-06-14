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

import { CheckCircle, XCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CopyButton } from '@/components/copy-button'
import type { TestResult } from '../types'

interface TestResultsProps {
  result: TestResult
}

export function TestResults({ result }: TestResultsProps) {
  const { t } = useTranslation()

  const statusVariant =
    result.statusCode >= 200 && result.statusCode < 300
      ? 'default'
      : 'destructive'

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2 text-lg'>
          {result.success ? (
            <>
              <CheckCircle className='h-5 w-5 text-emerald-500' />
              <span className='text-emerald-600 dark:text-emerald-400'>
                {t('Connection successful')}
              </span>
            </>
          ) : (
            <>
              <XCircle className='h-5 w-5 text-red-500' />
              <span className='text-red-600 dark:text-red-400'>
                {t('Connection failed')}
              </span>
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Stats row */}
        <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
          <div className='bg-muted/60 rounded-lg p-3'>
            <span className='text-muted-foreground text-xs'>{t('Status Code')}</span>
            <p className='mt-1 font-mono text-sm font-semibold'>
              <Badge variant={statusVariant}>{result.statusCode}</Badge>
            </p>
          </div>
          <div className='bg-muted/60 rounded-lg p-3'>
            <span className='text-muted-foreground text-xs'>{t('Latency')}</span>
            <p className='mt-1 font-mono text-sm font-semibold'>{result.latencyMs}ms</p>
          </div>
          <div className='bg-muted/60 rounded-lg p-3'>
            <span className='text-muted-foreground text-xs'>{t('Tokens')}</span>
            <p className='mt-1 font-mono text-sm font-semibold'>
              {result.tokensUsed !== null && result.tokensUsed > 0
                ? result.tokensUsed
                : '—'}
            </p>
          </div>
          <div className='bg-muted/60 rounded-lg p-3'>
            <span className='text-muted-foreground text-xs'>{t('Endpoint')}</span>
            <p className='mt-1 font-mono text-xs font-semibold truncate'>
              {result.endpointPath}
            </p>
          </div>
        </div>

        {/* Error message */}
        {result.errorMessage && (
          <div className='rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-950/30'>
            <p className='text-sm text-red-700 dark:text-red-300'>
              {result.errorMessage}
            </p>
          </div>
        )}

        {/* Response body */}
        <div>
          <div className='mb-1.5 flex items-center justify-between'>
            <span className='text-muted-foreground text-xs font-medium'>
              {t('Response Body')}
            </span>
            {result.responseBody && (
              <CopyButton
                value={result.responseBody}
                size='sm'
              />
            )}
          </div>
          <pre className='bg-muted/30 max-h-80 overflow-auto rounded-lg border p-4 text-xs font-mono whitespace-pre-wrap break-all'>
            {result.responseBody || '—'}
          </pre>
        </div>
      </CardContent>
    </Card>
  )
}
