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

export interface RelayStation {
  id: number
  name: string
  group: string
  status: number
  response_time: number
  used_quota: number
  models: string
  test_time: number
}

export interface RelayStationResponse {
  stations: RelayStation[]
  updated_at: number
}

export interface ModelLeaderboardItem {
  model_name: string
  vendor: string
  vendor_icon?: string
  success_rate: number
  avg_latency_ms: number
  avg_ttft_ms: number
  avg_tps: number
  request_count: number
  token_usage: number
  model_price: number
  quota_type: number
}

export interface ModelLeaderboardResponse {
  models: ModelLeaderboardItem[]
  updated_at: number
}

export interface AINewsItem {
  title: string
  link: string
  source: string
  pub_date: string
  thumbnail: string
}

export interface AINewsResponse {
  articles: AINewsItem[]
  updated_at: number
}

export interface TestDimension {
  name: string
  score: number
  passed: boolean
  details: string
}

export interface HomepageTestResult {
  success: boolean
  dimensions: TestDimension[]
  total_score: number
  latency_ms: number
  model: string
  ref_model: string
  prompt_tokens: number
  completion_tokens: number
  tokens_per_sec: number
}

export interface HomepageTestRequest {
  api_address: string
  api_key: string
  model: string
  ref_model: string
  cache_detection: boolean
}

export interface HomePageContentResult {
  content: string
  isLoaded: boolean
  isUrl: boolean
}
