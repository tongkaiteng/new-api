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
import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import {
  type SortingState,
  type VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useMediaQuery } from '@/hooks'
import { useTranslation } from 'react-i18next'
import { useTableUrlState } from '@/hooks/use-table-url-state'
import { DataTablePage } from '@/components/data-table'
import {
  getFreeTokenSitesAdmin,
  searchFreeTokenSitesAdmin,
} from '../api'
import { useFreeTokenSitesColumns } from './free-token-sites-columns'
import { useFreeTokenSitesContext } from './free-token-sites-provider'

const route = getRouteApi('/_authenticated/free-token-sites/')

export function FreeTokenSitesTable() {
  const { t } = useTranslation()
  const columns = useFreeTokenSitesColumns()
  const { refreshTrigger } = useFreeTokenSitesContext()
  const isMobile = useMediaQuery('(max-width: 640px)')
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  const {
    globalFilter,
    onGlobalFilterChange,
    pagination,
    onPaginationChange,
    ensurePageInRange,
  } = useTableUrlState({
    search: route.useSearch(),
    navigate: route.useNavigate(),
    pagination: { defaultPage: 1, defaultPageSize: isMobile ? 10 : 20 },
    globalFilter: { enabled: true, key: 'filter' },
  })

  const { data, isLoading, isFetching } = useQuery({
    queryKey: [
      'free-token-sites-admin',
      pagination.pageIndex + 1,
      pagination.pageSize,
      globalFilter,
      refreshTrigger,
    ],
    queryFn: async () => {
      const params = {
        p: pagination.pageIndex + 1,
        page_size: pagination.pageSize,
      }
      const keyword = globalFilter?.trim()
      const result = keyword
        ? await searchFreeTokenSitesAdmin(keyword, params.p, params.page_size)
        : await getFreeTokenSitesAdmin(params.p, params.page_size)

      return {
        items: result.data?.items || [],
        total: result.data?.total || 0,
      }
    },
  })

  const items = data?.items ?? []
  const total = data?.total ?? 0

  const pageCount = useMemo(() => {
    return Math.max(Math.ceil(total / pagination.pageSize), 1)
  }, [total, pagination.pageSize])

  const table = useReactTable({
    data: items,
    columns,
    pageCount,
    state: {
      sorting,
      columnVisibility,
      pagination,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange,
    onGlobalFilterChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: !globalFilter?.trim(),
  })

  ensurePageInRange(pageCount)

  return (
    <DataTablePage
      table={table}
      columns={columns}
      isLoading={isLoading}
      isFetching={isFetching}
      emptyTitle={t('No free token sites found')}
      toolbarProps={{
        searchPlaceholder: t('Search sites...'),
      }}
    />
  )
}
