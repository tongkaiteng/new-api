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
import type { RelayStationResponse, AINewsResponse, HomepageTestResult, HomepageTestRequest, ModelLeaderboardResponse } from './types'

export async function getRelayStations(): Promise<RelayStationResponse> {
  const res = await api.get('/api/relay-stations')
  return res.data.data
}

export async function getModelLeaderboard(): Promise<ModelLeaderboardResponse> {
  const res = await api.get('/api/model-leaderboard')
  return res.data.data
}

export async function getAINews(): Promise<AINewsResponse> {
  const res = await api.get('/api/ai-news')
  return res.data.data
}

export async function runHomepageTest(payload: HomepageTestRequest): Promise<HomepageTestResult> {
  const res = await api.post('/api/homepage-test', payload)
  return res.data.data
}

export async function getHomePageContent(): Promise<{ success: boolean; data: string }> {
  const res = await api.get('/api/home_page_content')
  return res.data
}
