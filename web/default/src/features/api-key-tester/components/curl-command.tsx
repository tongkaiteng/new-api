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

import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CopyButton } from '@/components/copy-button'
import { generateCurlFromResult } from '../lib/generate-curl'
import type { TestFormState, TestResult } from '../types'

interface CurlCommandProps {
  formState: TestFormState
  result: TestResult | null
}

export function CurlCommand({ formState, result }: CurlCommandProps) {
  const { t } = useTranslation()

  const curlCmd = result?.requestBody
    ? generateCurlFromResult(formState, result.requestBody)
    : ''

  if (!curlCmd) return null

  return (
    <Card>
      <CardHeader className='pb-3'>
        <CardTitle className='flex items-center justify-between text-base'>
          <span>{t('Equivalent curl command')}</span>
          <CopyButton value={curlCmd} size='sm' />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <pre className='bg-muted/30 overflow-x-auto rounded-lg border p-4 text-xs font-mono whitespace-pre-wrap break-all'>
          {curlCmd}
        </pre>
      </CardContent>
    </Card>
  )
}
