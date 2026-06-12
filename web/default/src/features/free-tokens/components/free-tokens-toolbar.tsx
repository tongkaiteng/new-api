import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { List, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatQuota } from '@/lib/format'
import type { AuthUser } from '@/stores/auth-store'

interface FreeTokensToolbarProps {
  isAuthed: boolean
  authUser: AuthUser | null
  onSignIn: () => void
  claimsDefaultTab?: 'api-keys' | 'codes'
}

export function FreeTokensToolbar(props: FreeTokensToolbarProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <div className='flex items-center justify-between gap-4'>
      <div className='flex items-baseline gap-2'>
        <span className='text-muted-foreground text-sm'>
          {t('My Quota')}：
        </span>
        <span className='text-base font-extrabold'>
          {formatQuota(props.authUser?.quota ?? 0)}
        </span>
        <span className='text-muted-foreground text-xs'>
          {t('Share Token to Earn Quota')}
        </span>
      </div>
      <div className='flex items-center gap-4'>
        <Button
          variant='outline'
          size='sm'
          onClick={() => navigate({ to: '/free-tokens/share' })}
        >
          <Share2 className='mr-1.5 h-4 w-4' />
          {t('Share Token')}
        </Button>
        <Button
          variant='outline'
          size='sm'
          onClick={() => {
            if (!props.isAuthed) {
              props.onSignIn()
              return
            }
            navigate({
              to: '/free-tokens/claims',
              search: props.claimsDefaultTab ? { tab: props.claimsDefaultTab } : undefined,
            })
          }}
        >
          <List className='mr-1.5 h-4 w-4' />
          {t('My Claims')}
        </Button>
      </div>
    </div>
  )
}
