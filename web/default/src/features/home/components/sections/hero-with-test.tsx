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
import { Shield, Sparkles } from 'lucide-react'
import { TestForm } from '../test-widget/test-form'
import { TestResultsRing } from '../test-widget/test-results-ring'
import { useHomepageTest } from '../../hooks/use-homepage-test'
import type { HomepageTestResult } from '../../types'
import { useState } from 'react'

export function HeroWithTest() {
  const { t } = useTranslation()
  const testMutation = useHomepageTest()
  const [result, setResult] = useState<HomepageTestResult | null>(null)

  const handleTest = (payload: any) => {
    setResult(null)
    testMutation.mutate(payload, {
      onSuccess: (data) => setResult(data),
    })
  }

  return (
    <section className='space-y-8'>
      <div className='text-left space-y-2'>
        <h1 className='text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl'>
          {t('Pick Reliable Relay Stations')}
        </h1>
      </div>

      <TestForm onSubmit={handleTest} isLoading={testMutation.isPending} />

      {result && <TestResultsRing result={result} />}

      <div className='flex items-center justify-center gap-8 pt-2'>
        <span className='flex items-center gap-2 text-xs text-muted-foreground'>
          <Shield className='h-3.5 w-3.5 text-emerald-500/70' />
          {t('End-to-end encrypted. Your key is never stored.')}
        </span>
        <span className='flex items-center gap-2 text-xs text-muted-foreground'>
          <Sparkles className='h-3.5 w-3.5 text-amber-500/70' />
          已为用户检测 1M+ 次
        </span>
      </div>
    </section>
  )
}
