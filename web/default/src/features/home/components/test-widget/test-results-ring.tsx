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

import { useMemo } from 'react'
import { VChart } from '@visactor/react-vchart'
import { useChartTheme } from '@/lib/use-chart-theme'
import { CheckCircle2, ExternalLink, Globe, XCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import type { HomepageTestResult } from '../../types'

interface TestResultsRingProps {
  result: HomepageTestResult
}

function formatMs(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

export function TestResultsRing({ result }: TestResultsRingProps) {
  const theme = useChartTheme()
  const passed = result.total_score >= 60

  const ringSpec = useMemo(() => ({
    type: 'pie',
    data: [{
      values: [
        { category: 'Score', value: Math.round(result.total_score) },
        { category: 'Remaining', value: Math.max(0, 100 - Math.round(result.total_score)) },
      ],
    }],
    categoryField: 'category',
    valueField: 'value',
    innerRadius: 0.7,
    outerRadius: 0.85,
    color: {
      specified: {
        Score: passed ? '#22c55e' : '#ef4444',
        Remaining: '#e5e7eb',
      },
    },
    legends: { visible: false },
    tooltip: { visible: false },
    background: 'transparent',
    animationAppear: { duration: 800, easing: 'cubicOut' },
  }), [result.total_score, passed])

  return (
    <Card className='border-border/50 shadow-none'>
      <CardHeader className='pb-4'>
        <CardTitle className='text-base font-semibold tracking-tight'>检测结果</CardTitle>
      </CardHeader>
      <CardContent className='pt-0'>
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
          {/* Left side — model, ring score, timing, attribution */}
          <div className='flex flex-col items-center gap-5'>
            {/* Detected model */}
            <div className='text-center'>
              <span className='text-muted-foreground text-[11px] tracking-wide uppercase'>检测模型</span>
              <p className='text-sm font-mono font-medium text-foreground mt-1'>{result.model}</p>
            </div>

            {/* Ring chart with overall score */}
            <div className='relative h-[150px] w-[150px]'>
              <VChart spec={ringSpec} options={{ mode: 'desktop-browser' }} theme={theme} />
              <div className='absolute inset-0 flex flex-col items-center justify-center'>
                <span className={`text-3xl font-bold tracking-tight ${passed ? 'text-emerald-500' : 'text-red-500'}`}>
                  {Math.round(result.total_score)}%
                </span>
                <span className={`text-[11px] font-medium mt-0.5 tracking-wide ${passed ? 'text-emerald-500/80' : 'text-red-500/80'}`}>
                  {passed ? '达标' : '未达标'}
                </span>
              </div>
            </div>

            {/* Latency and attribution */}
            <div className='flex flex-col items-center gap-2 text-center'>
              <div className='flex items-center gap-2 text-[13px]'>
                <span className='text-muted-foreground'>检测耗时</span>
                <span className='font-mono font-semibold text-foreground'>{formatMs(result.latency_ms)}</span>
              </div>
              <div className='flex items-center gap-1 text-[11px] text-muted-foreground/70'>
                <Globe className='h-3 w-3' />
                <span>检测方：</span>
                <a
                  href='https://token.zhongxiang100.com'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='inline-flex items-center gap-0.5 text-primary/80 hover:text-primary hover:underline transition-colors'
                >
                  众享100 Token
                  <ExternalLink className='h-2.5 w-2.5' />
                </a>
              </div>
            </div>
          </div>

          {/* Right side — dimension checks + metrics */}
          <div className='flex flex-col gap-5'>
            {/* 4 dimension checks: pass/fail only */}
            <div className='space-y-3'>
              {result.dimensions.map((dim, i) => (
                <div key={i} className='flex items-center justify-between'>
                  <span className='text-sm font-medium'>{dim.name}</span>
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                    dim.passed
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                      : 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400'
                  }`}>
                    {dim.passed
                      ? <CheckCircle2 className='h-3 w-3' />
                      : <XCircle className='h-3 w-3' />
                    }
                    {dim.passed ? '通过' : '返回结果不匹配'}
                  </span>
                </div>
              ))}
            </div>

            <Separator className='bg-border/40' />

            {/* 4 performance metrics */}
            <div className='grid grid-cols-2 gap-3'>
              {[
                { label: '延迟', value: formatMs(result.latency_ms) },
                { label: 'Tokens/秒', value: (result.tokens_per_sec ?? 0).toFixed(1) },
                { label: '输入Tokens', value: (result.prompt_tokens ?? 0).toLocaleString() },
                { label: '输出Tokens', value: (result.completion_tokens ?? 0).toLocaleString() },
              ].map((m) => (
                <div key={m.label} className='rounded-lg bg-muted/30 px-3 py-2.5'>
                  <span className='text-[10px] text-muted-foreground/70 tracking-wide uppercase'>{m.label}</span>
                  <p className='text-sm font-mono font-semibold mt-0.5'>{m.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
