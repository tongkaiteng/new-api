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
import { z } from 'zod'

export const FREE_TOKEN_SITE_STATUS = {
  ENABLED: 1,
  DISABLED: 2,
} as const

export const freeTokenSiteSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  site_url: z.string(),
  logo_url: z.string(),
  bonus: z.string(),
  status: z.number(),
  sort_order: z.number(),
  total_count: z.number(),
  available_count: z.number(),
  claimed_count: z.number(),
  created_time: z.number(),
  updated_time: z.number(),
})

export type FreeTokenSite = z.infer<typeof freeTokenSiteSchema>

export type ApiResponse<T = unknown> = {
  success: boolean
  message?: string
  data?: T
}

export type GetFreeTokenSitesResponse = ApiResponse<{
  items: FreeTokenSite[]
  total: number
  page: number
  page_size: number
}>

export type FreeTokenSiteFormData = {
  id?: number
  name: string
  description: string
  site_url: string
  logo_url: string
  bonus: string
  status: number
  sort_order: number
  codes_text: string
}

export type FreeTokenSitesDialogType = 'create' | 'update' | 'delete'
