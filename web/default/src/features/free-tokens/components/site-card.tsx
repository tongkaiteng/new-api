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
import { useState } from 'react'
import { Copy, ExternalLink, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import type { FreeTokenSitePublic } from '../types'
import { FreeTokensGuide } from './free-tokens-guide'
type FreeTokenSiteTableProps = {
  sites: FreeTokenSitePublic[]
  isAuthed: boolean
  claimingSiteId: number | null
  onClaim: (siteId: number) => void
  onSignIn: () => void
}

export function FreeTokenSiteTable(props: FreeTokenSiteTableProps) {
  const { sites, isAuthed, claimingSiteId, onClaim, onSignIn } = props
  const { t } = useTranslation()
  const { copyToClipboard } = useCopyToClipboard()
  const [detailSite, setDetailSite] = useState<FreeTokenSitePublic | null>(null)

  const handleCopyCode = (code: string) => {
    void copyToClipboard(code)
  }

  return (
    <>
      <FreeTokensGuide />
      <div className='overflow-hidden rounded-xl border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('Site name')}</TableHead>
              <TableHead>{t('Site URL')}</TableHead>
              <TableHead>{t('Bonus label')}</TableHead>
              <TableHead>{t('Remaining Codes')}</TableHead>
              <TableHead>{t('Claim Condition')}</TableHead>
              <TableHead>{t('Created At')}</TableHead>
              <TableHead className='text-right'>{t('Actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sites.map((site) => {
              const outOfStock = site.available_count <= 0
              const isClaiming = claimingSiteId === site.id

              return (
                <TableRow key={site.id}>
                  <TableCell>
                    <div className='flex items-center gap-2.5'>
                      {site.logo_url ? (
                        <img
                          src={site.logo_url}
                          alt={site.name}
                          className='h-7 w-7 rounded border object-cover'
                        />
                      ) : (
                        <div className='bg-muted flex h-7 w-7 items-center justify-center rounded text-xs font-semibold'>
                          {site.name.slice(0, 1).toUpperCase()}
                        </div>
                      )}
                      <span className='font-medium'>{site.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <a
                      href={site.site_url}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='inline-flex max-w-[180px] items-center gap-1 truncate text-sm underline-offset-4 hover:underline'
                    >
                      {site.site_url}
                      <ExternalLink className='h-3 w-3 shrink-0' />
                    </a>
                  </TableCell>
                  <TableCell>{site.bonus || '—'}</TableCell>
                  <TableCell>
                    <span
                      className={
                        outOfStock ? 'text-muted-foreground' : ''
                      }
                    >
                      {site.available_count} / {site.total_count}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={
                        site.claimed
                          ? 'text-muted-foreground text-sm'
                          : 'text-green-600 dark:text-green-400 text-sm font-medium'
                      }
                    >
                      {site.claimed ? t('Claimed') : t('Eligible')}
                    </span>
                  </TableCell>
                  <TableCell className='text-muted-foreground text-sm'>
                    {site.created_time
                      ? formatTimestamp(site.created_time)
                      : '—'}
                  </TableCell>
                  <TableCell className='text-right'>
                    <div className='flex items-center justify-end gap-1.5'>
                      {site.claimed ? (
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => setDetailSite(site)}
                        >
                          {t('View')}
                        </Button>
                      ) : outOfStock ? (
                        <Button size='sm' disabled>
                          {t('Out of stock')}
                        </Button>
                      ) : !isAuthed ? (
                        <Button
                          size='sm'
                          onClick={onSignIn}
                          className='bg-emerald-500 text-white hover:bg-emerald-600'
                        >
                          {t('Claim')}
                        </Button>
                      ) : (
                        <Button
                          size='sm'
                          disabled={isClaiming}
                          onClick={() => onClaim(site.id)}
                          className='bg-emerald-500 text-white hover:bg-emerald-600'
                        >
                          {isClaiming ? (
                            <Loader2 className='mr-1.5 h-3.5 w-3.5 animate-spin' />
                          ) : null}
                          {t('Claim')}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Detail dialog */}
      <Dialog
        open={!!detailSite}
        onOpenChange={(open) => {
          if (!open) setDetailSite(null)
        }}
      >
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>{t('View details')}</DialogTitle>
          </DialogHeader>
          {detailSite && (
            <div className='space-y-4'>
              <div className='flex items-center gap-3'>
                {detailSite.logo_url ? (
                  <img
                    src={detailSite.logo_url}
                    alt={detailSite.name}
                    className='h-12 w-12 rounded-lg border object-cover'
                  />
                ) : (
                  <div className='bg-muted flex h-12 w-12 items-center justify-center rounded-lg text-lg font-semibold'>
                    {detailSite.name.slice(0, 1).toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className='text-lg font-semibold'>{detailSite.name}</h3>
                  {detailSite.bonus ? (
                    <span className='text-muted-foreground text-sm'>
                      {detailSite.bonus}
                    </span>
                  ) : null}
                </div>
              </div>

              {detailSite.description && (
                <div>
                  <span className='text-muted-foreground text-xs font-medium'>
                    {t('Description')}
                  </span>
                  <p className='mt-1 text-sm'>{detailSite.description}</p>
                </div>
              )}

              <div className='bg-muted/60 grid grid-cols-2 gap-3 rounded-lg p-3 text-sm'>
                <div>
                  <span className='text-muted-foreground text-xs'>
                    {t('Site URL')}
                  </span>
                  <a
                    href={detailSite.site_url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='mt-0.5 block truncate underline-offset-4 hover:underline'
                  >
                    {detailSite.site_url}
                  </a>
                </div>
                <div>
                  <span className='text-muted-foreground text-xs'>
                    {t('Remaining Codes')}
                  </span>
                  <p className='mt-0.5'>
                    {detailSite.available_count} / {detailSite.total_count}
                  </p>
                </div>
                <div>
                  <span className='text-muted-foreground text-xs'>
                    {t('Claim Condition')}
                  </span>
                  <p className='mt-0.5'>
                    {detailSite.claimed ? t('Claimed') : t('Eligible')}
                  </p>
                </div>
                <div>
                  <span className='text-muted-foreground text-xs'>
                    {t('Created At')}
                  </span>
                  <p className='mt-0.5'>
                    {detailSite.created_time
                      ? formatTimestamp(detailSite.created_time)
                      : '—'}
                  </p>
                </div>
              </div>

              {detailSite.claimed && detailSite.code ? (
                <div className='bg-muted/60 rounded-lg border p-3'>
                  <p className='text-muted-foreground mb-1 text-xs font-medium'>
                    {t('Your code')}
                  </p>
                  <div className='flex items-center gap-2'>
                    <code className='min-w-0 flex-1 truncate text-sm font-semibold'>
                      {detailSite.code}
                    </code>
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      className='h-8 w-8 shrink-0'
                      onClick={() => handleCopyCode(detailSite.code!)}
                    >
                      <Copy className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
