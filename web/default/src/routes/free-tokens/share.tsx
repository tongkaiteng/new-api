import { createFileRoute } from '@tanstack/react-router'
import { PublicLayout } from '@/components/layout'
import { PageTransition } from '@/components/page-transition'
import { FreeApiKeySubmitForm } from '@/features/free-tokens/components/api-key-submit-form'

export const Route = createFileRoute('/free-tokens/share')({
  component: FreeApiKeySubmitPage,
})

function FreeApiKeySubmitPage() {
  return (
    <PublicLayout showMainContainer={false}>
      <PageTransition className='mx-auto w-full max-w-[1280px] space-y-8 px-3 py-16 sm:px-6 sm:py-20 xl:px-8'>
        <FreeApiKeySubmitForm />
      </PageTransition>
    </PublicLayout>
  )
}
