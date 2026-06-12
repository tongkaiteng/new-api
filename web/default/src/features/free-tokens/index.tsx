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
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { PublicLayout } from '@/components/layout'
import { PageTransition } from '@/components/page-transition'
import { useAuthStore } from '@/stores/auth-store'
import {
  useClaimFreeToken,
  useFreeTokenSites,
} from './hooks/use-free-tokens'

import { FreeTokenSiteTable } from './components/site-card'
import { FreeTokensToolbar } from './components/free-tokens-toolbar'

function FreeTokensLoading() {
  return (
    <div className='overflow-hidden rounded-xl border'>
      <Skeleton className='h-[300px] w-full rounded-none' />
    </div>
  )
}

export function FreeTokens() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const authUser = useAuthStore((state) => state.auth.user)
  const isAuthed = Boolean(authUser)

  const sitesQuery = useFreeTokenSites()
  const claimMutation = useClaimFreeToken()

  const sites = sitesQuery.data?.data ?? []

  const handleSignIn = () => {
    navigate({
      to: '/sign-in',
      search: { redirect: '/free-tokens' },
    })
  }

  const handleClaim = async (siteId: number) => {
    try {
      const result = await claimMutation.mutateAsync(siteId)
      if (result.success) {
        toast.success(t('Code claimed successfully'))
        return
      }
      toast.error(result.message || t('Failed to claim code'))
    } catch {
      toast.error(t('Failed to claim code'))
    }
  }

  return (
    <PublicLayout showMainContainer={false}>
      <PageTransition className='mx-auto w-full max-w-[1280px] space-y-10 px-3 py-16 sm:px-6 sm:py-20 xl:px-8'>

        {/* Page title */}
        <h1 className='text-2xl font-extrabold tracking-tight sm:text-3xl'>
          {t('Get Redeem Code')}
        </h1>

        {/* Toolbar */}
        <FreeTokensToolbar
          isAuthed={isAuthed}
          authUser={authUser}
          onSignIn={handleSignIn}
          claimsDefaultTab='codes'
        />

        {sitesQuery.isLoading ? (
          <FreeTokensLoading />
        ) : sites.length === 0 ? (
          <div className='text-muted-foreground rounded-xl border border-dashed p-10 text-center text-sm'>
            {t('No free token offers available right now.')}
          </div>
        ) : (
          <FreeTokenSiteTable
            sites={sites}
            isAuthed={isAuthed}
            claimingSiteId={
              claimMutation.isPending ? claimMutation.variables : null
            }
            onClaim={handleClaim}
            onSignIn={handleSignIn}
          />
        )}
      </PageTransition>
    </PublicLayout>
  )
}
