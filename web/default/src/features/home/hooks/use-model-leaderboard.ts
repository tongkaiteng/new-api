import { useQuery } from '@tanstack/react-query'
import { getModelLeaderboard } from '../api'

export function useModelLeaderboard() {
  return useQuery({
    queryKey: ['model-leaderboard'],
    queryFn: getModelLeaderboard,
    staleTime: 5 * 60 * 1000,
  })
}
