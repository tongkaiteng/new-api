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
import { api } from '@/lib/api'
import type {
  ApiResponse,
  FreeTokenSite,
  FreeTokenSiteFormData,
  GetFreeTokenSitesResponse,
} from './types'

export async function getFreeTokenSitesAdmin(
  p = 1,
  pageSize = 10
): Promise<GetFreeTokenSitesResponse> {
  const res = await api.get(
    `/api/free-token-site/?p=${p}&page_size=${pageSize}`
  )
  return res.data
}

export async function searchFreeTokenSitesAdmin(
  keyword: string,
  p = 1,
  pageSize = 10
): Promise<GetFreeTokenSitesResponse> {
  const res = await api.get(
    `/api/free-token-site/search?keyword=${encodeURIComponent(keyword)}&p=${p}&page_size=${pageSize}`
  )
  return res.data
}

export async function getFreeTokenSiteAdmin(
  id: number
): Promise<ApiResponse<FreeTokenSite>> {
  const res = await api.get(`/api/free-token-site/${id}`)
  return res.data
}

export async function createFreeTokenSite(
  data: FreeTokenSiteFormData
): Promise<ApiResponse<FreeTokenSite>> {
  const res = await api.post('/api/free-token-site/', {
    ...data,
    codes_text: data.codes_text,
  })
  return res.data
}

export async function updateFreeTokenSite(
  data: FreeTokenSiteFormData & { id: number }
): Promise<ApiResponse<FreeTokenSite>> {
  const res = await api.put('/api/free-token-site/', {
    ...data,
    codes_text: data.codes_text,
  })
  return res.data
}

export async function addFreeTokenSiteCodes(
  id: number,
  codesText: string
): Promise<ApiResponse<{ inserted: number; site?: FreeTokenSite }>> {
  const res = await api.post(`/api/free-token-site/${id}/codes`, {
    codes_text: codesText,
  })
  return res.data
}

export async function deleteFreeTokenSite(id: number): Promise<ApiResponse> {
  const res = await api.delete(`/api/free-token-site/${id}`)
  return res.data
}
