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
  FreeApiKeyAdmin,
  GetFreeApiKeysAdminResponse,
} from './types'

export async function getFreeApiKeysAdmin(
  p = 1,
  pageSize = 10,
  keyword = '',
  protocol = 0,
  status = -1
): Promise<GetFreeApiKeysAdminResponse> {
  const params = new URLSearchParams()
  params.set('p', String(p))
  params.set('page_size', String(pageSize))
  if (keyword) params.set('keyword', keyword)
  if (protocol > 0) params.set('protocol', String(protocol))
  if (status >= 0) params.set('status', String(status))
  const res = await api.get(`/api/free-api-key/?${params.toString()}`)
  return res.data
}

export async function getFreeApiKeyAdmin(
  id: number
): Promise<ApiResponse<FreeApiKeyAdmin>> {
  const res = await api.get(`/api/free-api-key/${id}`)
  return res.data
}

export async function updateFreeApiKeyStatus(
  id: number,
  status: number
): Promise<ApiResponse> {
  const res = await api.put('/api/free-api-key/', { id, status })
  return res.data
}

export async function deleteFreeApiKey(id: number): Promise<ApiResponse> {
  const res = await api.delete(`/api/free-api-key/${id}`)
  return res.data
}

export async function deleteInvalidFreeApiKeys(): Promise<
  ApiResponse<{ deleted: number }>
> {
  const res = await api.delete('/api/free-api-key/invalid')
  return res.data
}
