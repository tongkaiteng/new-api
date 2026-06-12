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
import { useState } from 'react'
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

function SiteLogo({ logoUrl, siteName }: { logoUrl: string; siteName: string }) {
  const [error, setError] = useState(false)
  if (!logoUrl || error) {
    return (
      <div className='bg-muted flex h-6 w-6 shrink-0 items-center justify-center rounded font-medium text-xs'>
        {siteName.charAt(0).toUpperCase()}
      </div>
    )
  }
  return (
    <img
      src={logoUrl}
      alt={siteName}
      className='h-6 w-6 shrink-0 rounded object-contain'
      onError={() => setError(true)}
    />
  )
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

      <div className='overflow-x-auto rounded-xl border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('Site name')}</TableHead>
              <TableHead>{t('Site URL')}</TableHead>
              <TableHead>{t('Bonus label')}</TableHead>
              <TableHead>{t('Code')}</TableHead>
              <TableHead>{t('Claimed at')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {claims.map((claim) => (
              <TableRow key={claim.id}>
                <TableCell className='font-medium'>
                  <div className='flex items-center gap-2'>
                    <SiteLogo logoUrl={claim.logo_url} siteName={claim.site_name} />
                    <span>{claim.site_name}</span>
                  </div>
                </TableCell>
                <TableCell>
                    <a
                      href={claim.site_url}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='inline-flex max-w-[180px] items-center gap-1 truncate text-sm underline-offset-4 hover:underline'
                    >
                      {claim.site_url}
                      <ExternalLink className='h-3 w-3 shrink-0' />
                    </a>
                </TableCell>
                <TableCell>{claim.bonus || '—'}</TableCell>
                <TableCell className='max-w-[200px]'>
                  <div className='flex items-center gap-1'>
                    <code className='min-w-0 flex-1 truncate text-sm'>{claim.code}</code>
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      className='h-7 w-7 shrink-0 p-0'
                      onClick={() => handleCopyCode(claim.code)}
                    >
                      <Copy className='h-3.5 w-3.5' />
                    </Button>
                  </div>
                </TableCell>
                <TableCell>{formatTimestamp(claim.claimed_time)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  )
}
