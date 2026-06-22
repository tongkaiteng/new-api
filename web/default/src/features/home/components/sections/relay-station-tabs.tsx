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

import { useTranslation } from 'react-i18next'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ModelLeaderboardTable } from '../model-leaderboard/model-leaderboard-table'
import { NewsGrid } from '../ai-news/news-grid'
import { useModelLeaderboard } from '../../hooks/use-model-leaderboard'
import { useAINews } from '../../hooks/use-ai-news'

export function RelayStationTabs() {
  const { t } = useTranslation()
  const leaderboardQuery = useModelLeaderboard()
  const newsQuery = useAINews()

  return (
    <Card className='border-border/50 shadow-none'>
      <CardHeader className='pb-3'>
        <CardTitle className='text-lg font-semibold tracking-tight'>{t('LLM Leaderboard & AI News')}</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue='leaderboard'>
          <TabsList className='mb-4'>
            <TabsTrigger value='leaderboard'>{t('Model Leaderboard')}</TabsTrigger>
            <TabsTrigger value='news'>{t('AI News')}</TabsTrigger>
          </TabsList>
          <TabsContent value='leaderboard'>
            {leaderboardQuery.isLoading ? (
              <div className='space-y-3'>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className='h-10 w-full' />
                ))}
              </div>
            ) : (
              <ModelLeaderboardTable models={leaderboardQuery.data?.models || []} />
            )}
          </TabsContent>
          <TabsContent value='news'>
            {newsQuery.isLoading ? (
              <div className='grid gap-4 sm:grid-cols-3'>
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className='h-32 w-full rounded-lg' />
                ))}
              </div>
            ) : (
              <NewsGrid articles={newsQuery.data?.articles || []} />
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
