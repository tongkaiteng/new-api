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
import { Badge } from '@/components/ui/badge'
import type { RelayStation } from '../../types'

const POPULAR_MODELS = [
  'claude-fable-5', 'claude-opus-4-8', 'gpt-5.5', 'gemini-3.1-pro-preview',
]

interface StationTableProps {
  stations: RelayStation[]
}

export function StationTable({ stations }: StationTableProps) {
  const { t } = useTranslation()

  if (stations.length === 0) {
    return (
      <p className='text-muted-foreground py-8 text-center text-sm'>
        暂无中转站数据
      </p>
    )
  }

  const topStations = stations.slice(0, 10)

  return (
    <div className='overflow-x-auto'>
      <table className='w-full text-sm'>
        <thead>
          <tr className='bg-muted/60 border-b'>
            <th className='px-3 py-2.5 text-left font-medium'>{t('Site')}</th>
            <th className='px-3 py-2.5 text-left font-medium'>{t('Group')}</th>
            <th className='px-3 py-2.5 text-left font-medium'>{t('Token Consumption')}</th>
            <th className='px-3 py-2.5 text-left font-medium'>{t('Uptime')}</th>
            <th className='px-3 py-2.5 text-left font-medium'>{t('Latency')}</th>
            <th className='px-3 py-2.5 text-left font-medium'>{t('Status')}</th>
          </tr>
        </thead>
        <tbody>
          {topStations.map((s) => (
            <tr key={s.id} className='border-b last:border-b-0 hover:bg-muted/30'>
              <td className='px-3 py-2.5 font-medium'>{s.name}</td>
              <td className='text-muted-foreground px-3 py-2.5'>{s.group || '—'}</td>
              <td className='text-muted-foreground px-3 py-2.5 text-xs'>
                {formatQuota(s.used_quota)}
              </td>
              <td className='px-3 py-2.5'>
                <Badge variant='default' className='bg-emerald-500 text-xs'>
                  {s.test_time > 0 ? '在线' : '—'}
                </Badge>
              </td>
              <td className='text-muted-foreground px-3 py-2.5'>
                {s.response_time > 0 ? `${(s.response_time / 1000).toFixed(1)}s` : '—'}
              </td>
              <td className='px-3 py-2.5'>
                <span className={`inline-block h-2 w-2 rounded-full ${s.status === 1 ? 'bg-emerald-500' : 'bg-red-500'}`} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function formatQuota(quota: number): string {
  if (quota >= 1_000_000_000) return `${(quota / 1_000_000_000).toFixed(1)}B`
  if (quota >= 1_000_000) return `${(quota / 1_000_000).toFixed(1)}M`
  if (quota >= 1_000) return `${(quota / 1_000).toFixed(1)}K`
  return String(quota)
}
