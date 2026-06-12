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
import { type ColumnDef } from '@tanstack/react-table'
import { Copy, Eye, FlaskConical, Loader2, Trash2, ToggleLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTableColumnHeader } from '@/components/data-table'
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard'
import { formatTimestamp } from '@/lib/format'
import { FREE_API_KEY_STATUS, PROTOCOL_OPTIONS, type FreeApiKeyAdmin } from '../types'
import { useFreeApiKeysAdminContext } from './free-api-keys-admin-provider'
import { useMutation } from '@tanstack/react-query'
import { testFreeApiKey } from '../api'

export function useFreeApiKeysAdminColumns(): ColumnDef<FreeApiKeyAdmin>[] {
  const { t } = useTranslation()
  const { setOpen, setCurrentRow, triggerRefresh } = useFreeApiKeysAdminContext()
  const { copyToClipboard } = useCopyToClipboard()

  const testMutation = useMutation({
    mutationFn: (id: number) => testFreeApiKey(id),
    onSuccess: (data) => {
      if (data.success) {
        const status = data.data?.status === FREE_API_KEY_STATUS.AVAILABLE
          ? t('Available')
          : t('Unavailable')
        toast.success(`${t('Test')}: ${status}`)
      } else {
        toast.error(data.message || t('Test failed'))
      }
      triggerRefresh()
    },
    onError: () => {
      toast.error(t('Test failed'))
    },
  })

  const getProtocolLabel = (protocol: number) => {
    const opt = PROTOCOL_OPTIONS.find((o) => o.value === protocol)
    return opt ? opt.label : t('Custom')
  }

  return [
    {
      accessorKey: 'id',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='ID' />
      ),
      cell: ({ row }) => (
        <span className='text-muted-foreground text-xs'>{row.original.id}</span>
      ),
      size: 60,
    },
    {
      accessorKey: 'api_address',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('API Address')} />
      ),
      cell: ({ row }) => (
        <span className='block max-w-[180px] truncate font-mono text-xs'>
          {row.original.api_address}
        </span>
      ),
    },
    {
      accessorKey: 'api_key',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('API Key')} />
      ),
      cell: ({ row }) => (
        <div className='flex max-w-[200px] items-center gap-1'>
          <code className='min-w-0 flex-1 truncate text-xs'>
            {row.original.api_key}
          </code>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            className='h-6 w-6 shrink-0 p-0'
            onClick={() => {
              copyToClipboard(row.original.api_key)
              toast.success(t('Copied'))
            }}
          >
            <Copy className='h-3 w-3' />
          </Button>
        </div>
      ),
    },
    {
      accessorKey: 'protocol',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('Protocol')} />
      ),
      cell: ({ row }) => (
        <Badge variant='outline' className='text-xs'>
          {getProtocolLabel(row.original.protocol)}
        </Badge>
      ),
    },
    {
      accessorKey: 'models',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('Models')} />
      ),
      cell: ({ row }) => (
        <span className='block max-w-[160px] truncate text-xs'>
          {row.original.models}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('Status')} />
      ),
      cell: ({ row }) => {
        const status = row.original.status
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
      },
    },
    {
      accessorKey: 'username',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('Shared by')} />
      ),
      cell: ({ row }) => (
        <span className='text-sm'>{row.original.username}</span>
      ),
    },
    {
      accessorKey: 'claim_count',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('Claimed')} />
      ),
      cell: ({ row }) => (
        <span className='text-sm'>{row.original.claim_count}</span>
      ),
      size: 80,
    },
    {
      accessorKey: 'test_time',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('Test Time')} />
      ),
      cell: ({ row }) => (
        <span className='text-sm'>
          {row.original.test_time ? formatTimestamp(row.original.test_time) : '—'}
        </span>
      ),
    },
    {
      accessorKey: 'created_time',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('Created')} />
      ),
      cell: ({ row }) => (
        <span className='text-sm'>
          {formatTimestamp(row.original.created_time)}
        </span>
      ),
    },
    {
      id: 'actions',
      header: t('Actions'),
      cell: ({ row }) => (
        <div className='flex items-center gap-1'>
          <Button
            variant='ghost'
            size='icon'
            title={t('Test')}
            disabled={testMutation.isPending}
            onClick={() => testMutation.mutate(row.original.id)}
          >
            {testMutation.isPending ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              <FlaskConical className='h-4 w-4' />
            )}
          </Button>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => {
              setCurrentRow(row.original)
              setOpen('view')
            }}
          >
            <Eye className='h-4 w-4' />
          </Button>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => {
              setCurrentRow(row.original)
              setOpen('status')
            }}
          >
            <ToggleLeft className='h-4 w-4' />
          </Button>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => {
              setCurrentRow(row.original)
              setOpen('delete')
            }}
          >
            <Trash2 className='h-4 w-4' />
          </Button>
        </div>
      ),
    },
  ]
}
