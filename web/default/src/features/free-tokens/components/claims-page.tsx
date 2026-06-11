import { useTranslation } from 'react-i18next'
import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useAuthStore } from '@/stores/auth-store'
import { useFreeTokenClaims } from '../hooks/use-free-tokens'
import { FreeTokenClaimsSection } from './claims-section'
import { ClaimedApiKeysSection } from './claimed-api-keys-section'

export function FreeTokenClaimsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const authUser = useAuthStore((state) => state.auth.user)
  const isAuthed = Boolean(authUser)

  const claimsQuery = useFreeTokenClaims(isAuthed)
  const claims = claimsQuery.data?.data ?? []

  if (!isAuthed) {
    return (
      <div className='text-muted-foreground rounded-xl border border-dashed p-10 text-center text-sm'>
        {t('Please sign in to view your claims.')}
      </div>
    )
  }

  return (
    <Tabs defaultValue='api-keys' className='space-y-4'>
      <TabsList>
        <TabsTrigger value='api-keys'>{t('Free API Keys')}</TabsTrigger>
        <TabsTrigger value='codes'>{t('Free Redeem Code')}</TabsTrigger>
      </TabsList>
      <TabsContent value='api-keys' className='space-y-4'>
        <button
          type='button'
          onClick={() => navigate({ to: '/free-tokens/api-keys' })}
          className='text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm transition-colors'
        >
          <ArrowLeft className='h-4 w-4' />
          {t('Back')}
        </button>
        <ClaimedApiKeysSection />
      </TabsContent>
      <TabsContent value='codes' className='space-y-4'>
        <button
          type='button'
          onClick={() => navigate({ to: '/free-tokens' })}
          className='text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm transition-colors'
        >
          <ArrowLeft className='h-4 w-4' />
          {t('Back')}
        </button>
        {claimsQuery.isLoading ? (
          <Skeleton className='h-40 rounded-xl' />
        ) : claims.length === 0 ? (
          <div className='text-muted-foreground rounded-xl border border-dashed p-10 text-center text-sm'>
            {t('You have not claimed any free tokens yet.')}
          </div>
        ) : (
          <FreeTokenClaimsSection claims={claims} />
        )}
      </TabsContent>
    </Tabs>
  )
}
