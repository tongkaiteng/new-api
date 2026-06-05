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
import { Copy, ExternalLink, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard'
import type { FreeTokenSitePublic } from '../types'

type FreeTokenSiteCardProps = {
  site: FreeTokenSitePublic
  isAuthed: boolean
  claiming: boolean
  onClaim: (siteId: number) => void
  onSignIn: () => void
}

function getStockLabel(site: FreeTokenSitePublic, t: (key: string, options?: object) => string) {
  if (site.total_count <= 0) {
    return t('No codes available')
  }
  return t('{{available}} / {{total}} codes remaining', {
    available: site.available_count,
    total: site.total_count,
  })
}

export function FreeTokenSiteCard(props: FreeTokenSiteCardProps) {
  const { site, isAuthed, claiming, onClaim, onSignIn } = props
  const { t } = useTranslation()
  const { copyToClipboard } = useCopyToClipboard()

  const outOfStock = site.available_count <= 0
  const stockLabel = getStockLabel(site, t)

  const handleCopyCode = () => {
    if (!site.code) return
    void copyToClipboard(site.code)
  }

  return (
    <Card className='flex h-full flex-col'>
      <CardHeader className='space-y-3'>
        <div className='flex items-start gap-3'>
          {site.logo_url ? (
            <img
              src={site.logo_url}
              alt={site.name}
              className='h-10 w-10 rounded-lg border object-cover'
            />
          ) : (
            <div className='bg-muted flex h-10 w-10 items-center justify-center rounded-lg text-sm font-semibold'>
              {site.name.slice(0, 1).toUpperCase()}
            </div>
          )}
          <div className='min-w-0 flex-1 space-y-1'>
            <CardTitle className='truncate text-base'>{site.name}</CardTitle>
            {site.bonus ? (
              <Badge variant='secondary' className='font-normal'>
                {site.bonus}
              </Badge>
            ) : null}
          </div>
        </div>
        {site.description ? (
          <CardDescription className='line-clamp-3'>
            {site.description}
          </CardDescription>
        ) : null}
      </CardHeader>

      <CardContent className='flex-1 space-y-3'>
        <p className='text-muted-foreground text-xs'>{stockLabel}</p>
        {site.claimed && site.code ? (
          <div className='bg-muted/60 rounded-lg border p-3'>
            <p className='text-muted-foreground mb-1 text-xs font-medium tracking-wide uppercase'>
              {t('Your code')}
            </p>
            <div className='flex items-center gap-2'>
              <code className='min-w-0 flex-1 truncate text-sm font-semibold'>
                {site.code}
              </code>
              <Button
                type='button'
                variant='ghost'
                size='icon'
                className='h-8 w-8 shrink-0'
                onClick={handleCopyCode}
              >
                <Copy className='h-4 w-4' />
              </Button>
            </div>
          </div>
        ) : null}
      </CardContent>

      <CardFooter className='flex flex-wrap gap-2'>
        {site.claimed ? (
          <>
            <Button variant='outline' size='sm' asChild>
              <a href={site.site_url} target='_blank' rel='noopener noreferrer'>
                {t('Visit site')}
                <ExternalLink className='ml-1.5 h-3.5 w-3.5' />
              </a>
            </Button>
            <Button variant='secondary' size='sm' onClick={handleCopyCode}>
              {t('Copy code')}
            </Button>
          </>
        ) : outOfStock ? (
          <Button size='sm' disabled>
            {t('Out of stock')}
          </Button>
        ) : !isAuthed ? (
          <Button size='sm' onClick={onSignIn}>
            {t('Sign in to claim')}
          </Button>
        ) : (
          <Button
            size='sm'
            disabled={claiming}
            onClick={() => onClaim(site.id)}
          >
            {claiming ? (
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            ) : null}
            {t('Claim code')}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
