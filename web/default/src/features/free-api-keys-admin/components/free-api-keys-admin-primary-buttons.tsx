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
import { Loader2, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useMutation } from '@tanstack/react-query'
import { deleteInvalidFreeApiKeys } from '../api'
import { useFreeApiKeysAdminContext } from './free-api-keys-admin-provider'

export function FreeApiKeysAdminPrimaryButtons() {
  const { t } = useTranslation()
  const { triggerRefresh } = useFreeApiKeysAdminContext()

  const deleteInvalidMutation = useMutation({
    mutationFn: deleteInvalidFreeApiKeys,
    onSuccess: (data) => {
      const count = data?.data?.deleted ?? 0
      toast.success(t('Deleted {{count}} invalid keys', { count }))
      triggerRefresh()
    },
    onError: () => {
      toast.error(t('Failed to delete'))
    },
  })

  return (
    <Button
      variant='destructive'
      size='sm'
      onClick={() => deleteInvalidMutation.mutate()}
      disabled={deleteInvalidMutation.isPending}
    >
      {deleteInvalidMutation.isPending ? (
        <Loader2 className='mr-1.5 h-4 w-4 animate-spin' />
      ) : (
        <Trash2 className='mr-1.5 h-4 w-4' />
      )}
      {t('Delete Invalid Keys')}
    </Button>
  )
}
