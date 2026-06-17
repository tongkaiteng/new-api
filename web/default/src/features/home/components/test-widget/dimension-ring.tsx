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

interface DimensionRingProps {
  name: string
  score: number
  passed: boolean
  details: string
}

export function DimensionRing({ name, score, passed, details }: DimensionRingProps) {
  const theme = useChartTheme()

  const spec = useMemo(() => ({
    type: 'pie',
    data: [{
      values: [
        { category: 'Pass', value: Math.round(score) },
        { category: 'Remaining', value: Math.max(0, 100 - Math.round(score)) },
      ],
    }],
    categoryField: 'category',
    valueField: 'value',
    innerRadius: 0.7,
    outerRadius: 0.85,
    color: {
      specified: {
        Pass: passed ? '#22c55e' : '#ef4444',
        Remaining: '#e5e7eb',
      },
    },
    legends: { visible: false },
    tooltip: { visible: false },
    background: 'transparent',
    animationAppear: { duration: 800, easing: 'cubicOut' },
  }), [score, passed])

  return (
    <div className='flex flex-col items-center gap-1.5'>
      <div className='relative h-[120px] w-[120px]'>
        <VChart spec={spec} options={{ mode: 'desktop-browser' }} theme={theme} />
        <div className='absolute inset-0 flex flex-col items-center justify-center'>
          <span className={`text-2xl font-bold ${passed ? 'text-emerald-500' : 'text-red-500'}`}>
            {Math.round(score)}%
          </span>
        </div>
      </div>
      <span className='text-xs font-medium text-center'>{name}</span>
      <span className='text-muted-foreground text-[10px] text-center px-2 leading-tight'>{details}</span>
    </div>
  )
}
