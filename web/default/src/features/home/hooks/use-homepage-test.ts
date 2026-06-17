import { useMutation, useQueryClient } from '@tanstack/react-query'
import { runHomepageTest } from '../api'
import type { HomepageTestRequest } from '../types'

export function useHomepageTest() {
  return useMutation({
    mutationFn: (payload: HomepageTestRequest) => runHomepageTest(payload),
  })
}
