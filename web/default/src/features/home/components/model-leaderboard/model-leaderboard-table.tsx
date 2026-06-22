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
import { getLobeIcon } from '@/lib/lobe-icon'
import { ModelLink, VendorLink } from '@/features/rankings/components/entity-links'
import type { ModelLeaderboardItem } from '../../types'

interface ModelLeaderboardTableProps {
  models: ModelLeaderboardItem[]
}

export function ModelLeaderboardTable({ models }: ModelLeaderboardTableProps) {
  const { t } = useTranslation()

  if (models.length === 0) {
    return (
      <p className='text-muted-foreground py-8 text-center text-sm'>
        {t('No model data available yet')}
      </p>
    )
  }

  const topModels = models.slice(0, 10)

  return (
    <div className='overflow-x-auto'>
      <table className='w-full text-sm'>
        <thead>
          <tr className='bg-muted/60 border-b'>
            <th className='px-3 py-2.5 text-left font-medium'>{t('Model')}</th>
            <th className='px-3 py-2.5 text-right font-medium'>{t('Success Rate')}</th>
            <th className='px-3 py-2.5 text-right font-medium'>{t('Avg Latency')}</th>
            <th className='px-3 py-2.5 text-right font-medium'>{t('TTFT')}</th>
            <th className='px-3 py-2.5 text-right font-medium'>{t('TPS')}</th>
            <th className='px-3 py-2.5 text-right font-medium'>{t('Requests')}</th>
            <th className='px-3 py-2.5 text-right font-medium'>{t('Price')}</th>
          </tr>
        </thead>
        <tbody>
          {topModels.map((m) => {
            const icon = getLobeIcon(m.vendor_icon || m.model_name, 16)
            return (
              <tr key={m.model_name} className='border-b last:border-b-0 hover:bg-muted/30'>
                <td className='px-3 py-2.5'>
                  <div className='flex items-center gap-2'>
                    {icon && <span className='shrink-0'>{icon}</span>}
                    <div className='min-w-0'>
                      <ModelLink modelName={m.model_name} className='font-medium text-sm' />
                      {m.vendor && (
                        <div className='text-muted-foreground text-xs'>
                          <VendorLink vendor={m.vendor} />
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className='px-3 py-2.5 text-right'>
                  <span className={successRateColor(m.success_rate)}>
                    {m.success_rate.toFixed(1)}%
                  </span>
                </td>
                <td className='text-muted-foreground px-3 py-2.5 text-right'>
                  {formatLatency(m.avg_latency_ms)}
                </td>
                <td className='text-muted-foreground px-3 py-2.5 text-right'>
                  {m.avg_ttft_ms > 0 ? `${m.avg_ttft_ms}ms` : '—'}
                </td>
                <td className='text-muted-foreground px-3 py-2.5 text-right'>
                  {m.avg_tps > 0 ? `${m.avg_tps.toFixed(1)}` : '—'}
                </td>
                <td className='text-muted-foreground px-3 py-2.5 text-right'>
                  {formatCount(m.request_count)}
                </td>
                <td className='text-muted-foreground px-3 py-2.5 text-right'>
                  {formatPrice(m.model_price, m.model_ratio, m.quota_type)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function successRateColor(rate: number): string {
  if (rate >= 95) return 'text-emerald-600'
  if (rate >= 85) return 'text-amber-600'
  return 'text-red-600'
}

function formatLatency(ms: number): string {
  if (ms <= 0) return '—'
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`
  return `${ms}ms`
}

function formatCount(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return '—'
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
  return String(value)
}

function formatPrice(price: number, ratio: number, quotaType: number): string {
  if (quotaType === 1 && price > 0) return `$${price.toFixed(2)}`
  if (ratio > 0) return `×${ratio.toFixed(1)}`
  return '—'
}
