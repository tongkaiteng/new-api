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
import { Copy } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard'
import { formatTimestamp } from '@/lib/format'
import { useClaimedFreeApiKeys } from '../hooks/use-free-tokens'
import { PROTOCOL_OPTIONS } from '../types'

export function ClaimedApiKeysSection() {
  const { t } = useTranslation()
  const { copyToClipboard } = useCopyToClipboard()
  const { data, isLoading } = useClaimedFreeApiKeys()

  const items = data?.data ?? []

  const getProtocolLabel = (protocol: number) => {
    const opt = PROTOCOL_OPTIONS.find((o) => o.value === protocol)
    return opt ? t(opt.key) : t('Custom')
  }

  if (isLoading) {
    return <Skeleton className='h-40 rounded-xl' />
  }

  if (items.length === 0) {
    return (
      <div className='text-muted-foreground rounded-xl border border-dashed p-10 text-center text-sm'>
        {t('No API keys found')}
      </div>
    )
  }

  return (
    <section className='space-y-4'>
      <div>
        <h2 className='text-lg font-semibold'>{t('My claimed API Keys')}</h2>
        <p className='text-muted-foreground text-sm'>
          {t('Review your claimed API Keys and copy them for use.')}
        </p>
      </div>

      <div className='overflow-hidden rounded-xl border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('API Address')}</TableHead>
            <TableHead>{t('API Key')}</TableHead>
            <TableHead>{t('Protocol Format')}</TableHead>
            <TableHead>{t('Supported Models')}</TableHead>
            <TableHead>{t('Claimed at')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className='max-w-[160px] truncate font-mono text-xs'>
                {item.api_address}
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  onClick={() => copyToClipboard(item.api_address)}
                >
                  <Copy className='mr-1.5 h-3.5 w-3.5' />
                </Button>
              </TableCell>
              <TableCell className='max-w-[120px] truncate font-mono text-xs'>
                {item.api_key}
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  onClick={() => copyToClipboard(item.api_key)}
                >
                  <Copy className='mr-1.5 h-3.5 w-3.5' />
                </Button>
              </TableCell>
              <TableCell>
                <Badge variant='outline' className='text-xs'>
                  {getProtocolLabel(item.protocol)}
                </Badge>
              </TableCell>
              <TableCell className='max-w-[140px] truncate text-xs'>
                {item.models}
              </TableCell>
              <TableCell className='text-sm'>
                {item.claimed_time ? formatTimestamp(item.claimed_time) : '—'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
    </section>
  )
}
