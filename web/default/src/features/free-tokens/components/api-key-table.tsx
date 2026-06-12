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
import { useNavigate } from '@tanstack/react-router'
import { Copy, Loader2, RotateCcw, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard'
import { useAuthStore } from '@/stores/auth-store'
import { useClaimFreeApiKey, useFreeApiKeys } from '../hooks/use-free-tokens'
import { PROTOCOL_OPTIONS, type FreeApiKey } from '../types'
import { FreeTokensToolbar } from './free-tokens-toolbar'

const PAGE_SIZE = 20

export function FreeApiKeyTable() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const authUser = useAuthStore((s) => s.auth.user)
  const isAuthed = Boolean(authUser)
  const { copyToClipboard } = useCopyToClipboard()

  const [page, setPage] = useState(1)
  const [keyword, setKeyword] = useState('')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [protocol, setProtocol] = useState<number>(0)
  const [searchProtocol, setSearchProtocol] = useState<number>(0)
  const [detailItem, setDetailItem] = useState<FreeApiKey | null>(null)
  const [claimingId, setClaimingId] = useState<number | null>(null)

  const { data, isLoading } = useFreeApiKeys({
    p: page,
    page_size: PAGE_SIZE,
    keyword: searchKeyword,
    protocol: searchProtocol,
  })

  const claimMutation = useClaimFreeApiKey()

  const items = data?.data?.items ?? []
  const total = data?.data?.total ?? 0
  const totalPages = Math.max(Math.ceil(total / PAGE_SIZE), 1)

  const handleSearch = () => {
    setPage(1)
    setSearchKeyword(keyword.trim())
    setSearchProtocol(protocol)
  }

  const handleReset = () => {
    setPage(1)
    setKeyword('')
    setSearchKeyword('')
    setProtocol(0)
    setSearchProtocol(0)
  }

  const getProtocolLabel = (protocol: number) => {
    const opt = PROTOCOL_OPTIONS.find((o) => o.value === protocol)
    return opt ? t(opt.key) : t('Custom')
  }

  const STATUS_CONFIG: Record<number, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    0: { label: t('Untested'), variant: 'secondary' },
    1: { label: t('Available'), variant: 'default' },
    2: { label: t('Unavailable'), variant: 'destructive' },
  }

  const getStatusLabel = (status: number | undefined) => {
    const cfg = STATUS_CONFIG[status ?? 0] ?? STATUS_CONFIG[0]
    return <Badge variant={cfg.variant} className='text-xs'>{cfg.label}</Badge>
  }

  const selectedProtocolLabel = protocol === 0 ? t('All') : getProtocolLabel(protocol)

  const handleClaim = async (item: FreeApiKey) => {
    if (!isAuthed) {
      navigate({
        to: '/sign-in',
        search: { redirect: '/free-tokens/api-keys' },
      })
      return
    }
    setClaimingId(item.id)
    try {
      const result = await claimMutation.mutateAsync(item.id)
      if (result.success) {
        toast.success(t('Claimed successfully'))
        setDetailItem(result.data ?? null)
      } else {
        toast.error(result.message || t('Claim failed'))
      }
    } catch {
      toast.error(t('Claim failed'))
    } finally {
      setClaimingId(null)
    }
  }

  return (
    <div className='space-y-4'>

      {/* Toolbar */}
      <FreeTokensToolbar
        isAuthed={isAuthed}
        authUser={authUser}
        onSignIn={() =>
          navigate({
            to: '/sign-in',
            search: { redirect: '/free-tokens/api-keys' },
          })
        }
      />
      {/* Search bar */}
      <div className='flex flex-wrap gap-2'>
        <Select
          value={String(protocol)}
          onValueChange={(v) => setProtocol(Number(v))}
        >
          <SelectTrigger className='w-[200px]'>
            <span className='text-muted-foreground text-xs'>{t('Protocol Format')}:</span>
            <span className='flex-1 text-left'>{selectedProtocolLabel}</span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='0'>{t('All')}</SelectItem>
            {PROTOCOL_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={String(opt.value)}>
                {t(opt.key)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className='relative flex-1 min-w-[200px]'>
          <Search className='text-muted-foreground absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2' />
          <Input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSearch()
            }}
            placeholder={t('Search models...') as string}
            className='pl-9'
          />
        </div>
        <Button variant='outline' onClick={handleSearch}>
          {t('Search')}
        </Button>
        <Button variant='ghost' size='icon' onClick={handleReset} title={t('Reset') as string}>
          <RotateCcw className='h-4 w-4' />
        </Button>
      </div>

      {/* Table */}
      <div className='overflow-hidden rounded-xl border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('API Address')}</TableHead>
              <TableHead>{t('Protocol Format')}</TableHead>
              <TableHead>{t('API Key')}</TableHead>
              <TableHead>{t('Supported Models')}</TableHead>
              <TableHead>{t('Status')}</TableHead>
              <TableHead>{t('Shared by')}</TableHead>
              <TableHead className='text-right'>{t('Actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={7}>
                    <Skeleton className='h-8 w-full' />
                  </TableCell>
                </TableRow>
              ))
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className='text-muted-foreground text-center'>
                  {t('No API keys found')}
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => {
                const isOwn = isAuthed && authUser?.id === item.user_id
                const isClaiming = claimingId === item.id

                return (
                  <TableRow key={item.id}>
                    <TableCell className='max-w-[160px] truncate font-mono text-xs'>
                      {item.api_address}
                    </TableCell>
                    <TableCell>
                      <Badge variant='outline' className='text-xs'>
                        {getProtocolLabel(item.protocol)}
                      </Badge>
                    </TableCell>
                    <TableCell className='max-w-[120px] truncate font-mono text-xs'>
                      {item.api_key}
                    </TableCell>
                    <TableCell className='max-w-[140px] truncate text-xs'>
                      {item.models}
                    </TableCell>
                    <TableCell>
                      {getStatusLabel(item.status)}
                    </TableCell>
                    <TableCell className='text-sm'>{item.username}</TableCell>
                    <TableCell className='text-right'>
                      <div className='flex items-center justify-end gap-1.5'>
                        {item.claimed || isOwn ? (
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => setDetailItem(item)}
                          >
                            {t('View')}
                          </Button>
                        ) : !isAuthed ? (
                          <Button
                            size='sm'
                            onClick={() =>
                              navigate({
                                to: '/sign-in',
                                search: { redirect: '/free-tokens/api-keys' },
                              })
                            }
                            className='bg-emerald-500 text-white hover:bg-emerald-600'
                          >
                            {t('Claim')}
                          </Button>
                        ) : (
                          <Button
                            size='sm'
                            disabled={isClaiming}
                            onClick={() => handleClaim(item)}
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
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              />
            </PaginationItem>
            <PaginationItem>
              <span className='text-sm'>
                {page} / {totalPages}
              </span>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Detail dialog */}
      <Dialog
        open={!!detailItem}
        onOpenChange={(open) => {
          if (!open) setDetailItem(null)
        }}
      >
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>{t('API Key Details')}</DialogTitle>
          </DialogHeader>
          {detailItem && (
            <div className='space-y-4'>
              <div className='bg-muted/60 grid grid-cols-2 gap-3 rounded-lg p-3 text-sm'>
                <div>
                  <span className='text-muted-foreground text-xs'>{t('API Address')}</span>
                  <p className='mt-0.5 truncate font-mono text-xs'>
                    {detailItem.api_address}
                  </p>
                </div>
                <div>
                  <span className='text-muted-foreground text-xs'>{t('Protocol Format')}</span>
                  <p className='mt-0.5'>{getProtocolLabel(detailItem.protocol)}</p>
                </div>
                <div className='col-span-2'>
                  <span className='text-muted-foreground text-xs'>{t('Supported Models')}</span>
                  <p className='mt-0.5'>{detailItem.models}</p>
                </div>
                <div className='col-span-2'>
                  <span className='text-muted-foreground text-xs'>{t('Shared by')}</span>
                  <p className='mt-0.5'>{detailItem.username}</p>
                </div>
                {detailItem.note && (
                  <div className='col-span-2'>
                    <span className='text-muted-foreground text-xs'>{t('Note')}</span>
                    <p className='mt-0.5 text-sm'>{detailItem.note}</p>
                  </div>
                )}
              </div>
              <div className='bg-muted/60 rounded-lg border p-3'>
                <p className='text-muted-foreground mb-1 text-xs font-medium'>
                  {t('API Key')}
                </p>
                <div className='flex items-center gap-2'>
                  <code className='min-w-0 flex-1 truncate text-sm font-semibold'>
                    {detailItem.api_key}
                  </code>
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    className='h-8 w-8 shrink-0'
                    onClick={() => copyToClipboard(detailItem.api_key)}
                  >
                    <Copy className='h-4 w-4' />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
