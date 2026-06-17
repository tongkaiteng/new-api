import { useQuery } from '@tanstack/react-query'
import { getRelayStations } from '../api'

export function useRelayStations() {
  return useQuery({
    queryKey: ['relay-stations'],
    queryFn: getRelayStations,
    staleTime: 5 * 60 * 1000,
  })
}
