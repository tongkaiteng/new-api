import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { List, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { AuthUser } from '@/stores/auth-store'

interface FreeTokensToolbarProps {
  isAuthed: boolean
  authUser: AuthUser | null
  onSignIn: () => void
}

export function FreeTokensToolbar(props: FreeTokensToolbarProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <div className='flex items-center justify-end gap-4'>
      <Button
        variant='outline'
        size='sm'
        onClick={() => navigate({ to: '/free-tokens/share' })}
      >
        <Share2 className='mr-1.5 h-4 w-4' />
        {t('Share Token')}
      </Button>
      <span className='text-muted-foreground text-sm'>
        {t('My Quota')}：¥{(props.authUser?.quota ?? 0).toFixed(2)}
      </span>
      <Button
        variant='outline'
        size='sm'
        onClick={() => {
          if (!props.isAuthed) {
            props.onSignIn()
            return
          }
          navigate({ to: '/free-tokens/claims' })
        }}
      >
        <List className='mr-1.5 h-4 w-4' />
        {t('My Claims')}
      </Button>
    </div>
  )
}
