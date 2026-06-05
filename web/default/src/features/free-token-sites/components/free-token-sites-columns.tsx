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
import { ExternalLink, Pencil, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTableColumnHeader } from '@/components/data-table'
import { FREE_TOKEN_SITE_STATUS } from '../constants'
import type { FreeTokenSite } from '../types'
import { useFreeTokenSitesContext } from './free-token-sites-provider'

export function useFreeTokenSitesColumns(): ColumnDef<FreeTokenSite>[] {
  const { t } = useTranslation()
  const { setOpen, setCurrentRow } = useFreeTokenSitesContext()

  return [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('Site name')} />
      ),
      cell: ({ row }) => (
        <div className='space-y-1'>
          <div className='font-medium'>{row.original.name}</div>
          {row.original.bonus ? (
            <div className='text-muted-foreground text-xs'>
              {row.original.bonus}
            </div>
          ) : null}
        </div>
      ),
    },
    {
      accessorKey: 'site_url',
      header: t('Site URL'),
      cell: ({ row }) => (
        <a
          href={row.original.site_url}
          target='_blank'
          rel='noopener noreferrer'
          className='inline-flex max-w-[220px] items-center gap-1 truncate text-sm underline-offset-4 hover:underline'
        >
          {row.original.site_url}
          <ExternalLink className='h-3.5 w-3.5 shrink-0' />
        </a>
      ),
    },
    {
      accessorKey: 'available_count',
      header: t('Codes'),
      cell: ({ row }) => {
        const site = row.original
        return `${site.available_count} / ${site.total_count}`
      },
    },
    {
      accessorKey: 'status',
      header: t('Status'),
      cell: ({ row }) => (
        <Badge
          variant={
            row.original.status === FREE_TOKEN_SITE_STATUS.ENABLED
              ? 'default'
              : 'secondary'
          }
        >
          {row.original.status === FREE_TOKEN_SITE_STATUS.ENABLED
            ? t('Enabled')
            : t('Disabled')}
        </Badge>
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
            onClick={() => {
              setCurrentRow(row.original)
              setOpen('update')
            }}
          >
            <Pencil className='h-4 w-4' />
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
