import { createFileRoute } from '@tanstack/react-router'
import { PublicLayout } from '@/components/layout'
import { PageTransition } from '@/components/page-transition'
import { FreeTokenClaimsPage } from '@/features/free-tokens/components/claims-page'

export const Route = createFileRoute('/free-tokens/claims')({
  component: ClaimsPage,
})

function ClaimsPage() {
  return (
    <PublicLayout showMainContainer={false}>
      <PageTransition className='mx-auto w-full max-w-[1280px] space-y-8 px-3 py-16 sm:px-6 sm:py-20 xl:px-8'>
        <FreeTokenClaimsPage />
      </PageTransition>
    </PublicLayout>
  )
}
