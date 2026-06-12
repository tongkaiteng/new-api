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
import { Copy, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard'
import { formatTimestamp } from '@/lib/format'
import { useMutation } from '@tanstack/react-query'
import {
  deleteFreeApiKey,
  updateFreeApiKeyStatus,
} from '../api'
import { FREE_API_KEY_STATUS, PROTOCOL_OPTIONS } from '../types'
import { useFreeApiKeysAdminContext } from './free-api-keys-admin-provider'

export function FreeApiKeysAdminDialogs() {
  const { t } = useTranslation()
  const { copyToClipboard } = useCopyToClipboard()
  const { open, setOpen, currentRow, triggerRefresh } =
    useFreeApiKeysAdminContext()

  const getProtocolLabel = (protocol: number) => {
    const opt = PROTOCOL_OPTIONS.find((o) => o.value === protocol)
    return opt ? opt.label : t('Custom')
  }

  const getStatusBadge = (status: number) => {
    if (status === FREE_API_KEY_STATUS.AVAILABLE) {
      return (
        <Badge className='bg-emerald-500 text-white hover:bg-emerald-600 text-xs'>
          {t('Available')}
        </Badge>
      )
    }
    if (status === FREE_API_KEY_STATUS.UNAVAILABLE) {
      return (
        <Badge variant='destructive' className='text-xs'>
          {t('Unavailable')}
        </Badge>
      )
    }
    return (
      <Badge variant='secondary' className='text-xs'>
        {t('Untested')}
      </Badge>
    )
  }

  const statusMutation = useMutation({
    mutationFn: (params: { id: number; status: number }) =>
      updateFreeApiKeyStatus(params.id, params.status),
    onSuccess: () => {
      toast.success(t('Status updated'))
      setOpen(null)
      triggerRefresh()
    },
    onError: () => {
      toast.error(t('Failed to update status'))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteFreeApiKey(id),
    onSuccess: () => {
      toast.success(t('Deleted'))
      setOpen(null)
      triggerRefresh()
    },
    onError: () => {
      toast.error(t('Failed to delete'))
    },
  })

  const newStatus =
    currentRow?.status === FREE_API_KEY_STATUS.AVAILABLE
      ? FREE_API_KEY_STATUS.UNAVAILABLE
      : FREE_API_KEY_STATUS.AVAILABLE

  const statusLabel =
    newStatus === FREE_API_KEY_STATUS.AVAILABLE
      ? t('Available')
      : t('Unavailable')

  return (
    <>
      {/* View Dialog */}
      <Dialog open={open === 'view'} onOpenChange={() => setOpen(null)}>
        <DialogContent className='sm:max-w-lg'>
          <DialogHeader>
            <DialogTitle>{t('API Key Details')}</DialogTitle>
          </DialogHeader>
          {currentRow && (
            <div className='min-w-0 space-y-4 overflow-hidden'>
              <div className='bg-muted/60 grid grid-cols-2 gap-3 rounded-lg p-3 text-sm'>
                <div>
                  <span className='text-muted-foreground text-xs'>ID</span>
                  <p className='mt-0.5'>{currentRow.id}</p>
                </div>
                <div>
                  <span className='text-muted-foreground text-xs'>{t('Status')}</span>
                  <p className='mt-0.5'>{getStatusBadge(currentRow.status)}</p>
                </div>
                <div className='col-span-2 min-w-0'>
                  <span className='text-muted-foreground text-xs'>{t('API Address')}</span>
                  <p className='mt-0.5 truncate font-mono text-xs'>
                    {currentRow.api_address}
                  </p>
                </div>
                <div>
                  <span className='text-muted-foreground text-xs'>{t('Protocol')}</span>
                  <p className='mt-0.5'>{getProtocolLabel(currentRow.protocol)}</p>
                </div>
                <div>
                  <span className='text-muted-foreground text-xs'>{t('Claim Count')}</span>
                  <p className='mt-0.5'>{currentRow.claim_count}</p>
                </div>
                <div className='col-span-2 min-w-0'>
                  <span className='text-muted-foreground text-xs'>{t('Models')}</span>
                  <p className='mt-0.5 break-words'>{currentRow.models}</p>
                </div>
                <div>
                  <span className='text-muted-foreground text-xs'>{t('Shared by')}</span>
                  <p className='mt-0.5'>{currentRow.username}</p>
                </div>
                <div>
                  <span className='text-muted-foreground text-xs'>{t('Test Time')}</span>
                  <p className='mt-0.5'>
                    {currentRow.test_time
                      ? formatTimestamp(currentRow.test_time)
                      : '—'}
                  </p>
                </div>
                {currentRow.note && (
                  <div className='col-span-2 min-w-0'>
                    <span className='text-muted-foreground text-xs'>{t('Note')}</span>
                    <p className='mt-0.5 break-words text-sm'>{currentRow.note}</p>
                  </div>
                )}
              </div>
              <div className='bg-muted/60 rounded-lg border p-3'>
                <p className='text-muted-foreground mb-1 text-xs font-medium'>
                  {t('API Key')}
                </p>
                <div className='flex min-w-0 items-center gap-2'>
                  <code className='min-w-0 flex-1 truncate text-sm font-semibold'>
                    {currentRow.api_key}
                  </code>
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    className='h-8 w-8 shrink-0'
                    onClick={() => {
                      copyToClipboard(currentRow.api_key)
                      toast.success(t('Copied'))
                    }}
                  >
                    <Copy className='h-4 w-4' />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Status Toggle Dialog */}
      <Dialog open={open === 'status'} onOpenChange={() => setOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('Update Status')}</DialogTitle>
            <DialogDescription>
              {t('Change status to')} "{statusLabel}"?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant='outline' onClick={() => setOpen(null)}>
              {t('Cancel')}
            </Button>
            <Button
              onClick={() => {
                if (currentRow) {
                  statusMutation.mutate({
                    id: currentRow.id,
                    status: newStatus,
                  })
                }
              }}
              disabled={statusMutation.isPending}
            >
              {statusMutation.isPending && (
                <Loader2 className='mr-1.5 h-4 w-4 animate-spin' />
              )}
              {t('Confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={open === 'delete'} onOpenChange={() => setOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('Delete API Key')}</DialogTitle>
            <DialogDescription>
              {t('Are you sure you want to delete this API key?')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant='outline' onClick={() => setOpen(null)}>
              {t('Cancel')}
            </Button>
            <Button
              variant='destructive'
              onClick={() => {
                if (currentRow) {
                  deleteMutation.mutate(currentRow.id)
                }
              }}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && (
                <Loader2 className='mr-1.5 h-4 w-4 animate-spin' />
              )}
              {t('Delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
