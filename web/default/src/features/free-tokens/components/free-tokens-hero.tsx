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
import { Gift } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function FreeTokensHero() {
  const { t } = useTranslation()

  return (
    <div className='space-y-3 text-center sm:space-y-4'>
      <div className='bg-primary/10 text-primary mx-auto flex h-12 w-12 items-center justify-center rounded-2xl sm:h-14 sm:w-14'>
        <Gift className='h-6 w-6 sm:h-7 sm:w-7' />
      </div>
      <div className='space-y-2'>
        <h1 className='text-2xl font-semibold tracking-tight sm:text-3xl'>
          {t('Free Tokens')}
        </h1>
        <p className='text-muted-foreground mx-auto max-w-2xl text-sm sm:text-base'>
          {t(
            'Claim free redemption codes from partner sites. Sign in to collect codes and revisit your claim history anytime.'
          )}
        </p>
      </div>
    </div>
  )
}
