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
import { Copy, ExternalLink } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
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
import type { FreeTokenClaimRecord } from '../types'

type FreeTokenClaimsSectionProps = {
  claims: FreeTokenClaimRecord[]
}

export function FreeTokenClaimsSection(props: FreeTokenClaimsSectionProps) {
  const { claims } = props
  const { t } = useTranslation()
  const { copyToClipboard } = useCopyToClipboard()

  if (claims.length === 0) {
    return null
  }

  const handleCopyCode = (code: string) => {
    void copyToClipboard(code)
  }

  return (
    <section className='space-y-4'>
      <div>
        <h2 className='text-lg font-semibold'>{t('My claimed codes')}</h2>
        <p className='text-muted-foreground text-sm'>
          {t('Review your claimed codes and jump to the corresponding sites.')}
        </p>
      </div>

      <div className='overflow-hidden rounded-xl border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('Site name')}</TableHead>
              <TableHead>{t('Bonus label')}</TableHead>
              <TableHead>{t('Code')}</TableHead>
              <TableHead>{t('Claimed at')}</TableHead>
              <TableHead className='text-right'>{t('Actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {claims.map((claim) => (
              <TableRow key={claim.id}>
                <TableCell className='font-medium'>{claim.site_name}</TableCell>
                <TableCell>{claim.bonus || '—'}</TableCell>
                <TableCell>
                  <code className='text-sm'>{claim.code}</code>
                </TableCell>
                <TableCell>{formatTimestamp(claim.claimed_time)}</TableCell>
                <TableCell className='text-right'>
                  <div className='flex justify-end gap-2'>
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      onClick={() => handleCopyCode(claim.code)}
                    >
                      <Copy className='mr-1.5 h-3.5 w-3.5' />
                      {t('Copy')}
                    </Button>
                    {claim.site_url ? (
                      <Button type='button' variant='outline' size='sm' asChild>
                        <a
                          href={claim.site_url}
                          target='_blank'
                          rel='noopener noreferrer'
                        >
                          {t('Visit site')}
                          <ExternalLink className='ml-1.5 h-3.5 w-3.5' />
                        </a>
                      </Button>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  )
}
