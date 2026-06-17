import { useQuery } from '@tanstack/react-query'
import { getAINews } from '../api'

export function useAINews() {
  return useQuery({
    queryKey: ['ai-news'],
    queryFn: getAINews,
    staleTime: 60 * 60 * 1000,
  })
}
