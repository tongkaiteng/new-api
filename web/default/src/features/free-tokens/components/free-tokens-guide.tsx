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
import { Ticket, ArrowRightLeft, Zap, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const STEPS = [
  {
    key: 'step1',
    icon: Ticket,
    titleKey: 'Claim your exclusive redemption code',
    descKey: 'Sign in and claim a free code from the list below',
  },
  {
    key: 'step2',
    icon: ArrowRightLeft,
    titleKey: 'Redeem on the partner site',
    descKey: 'Visit the partner site and use your code to top up',
  },
  {
    key: 'step3',
    icon: Zap,
    titleKey: 'Enjoy your balance',
    descKey: 'The redeemed amount is added to your account automatically',
  },
]

export function FreeTokensGuide() {
  const { t } = useTranslation()

  return (
    <div className='space-y-6'>
      <div className='grid gap-4 sm:grid-cols-3'>
        {STEPS.map((step, i) => (
          <div key={step.key} className='group relative'>
            {/* Step card */}
            <div className='bg-card hover:bg-accent/30 relative overflow-hidden rounded-xl border p-5 transition-colors duration-200 sm:p-6'>
              {/* Step number badge */}
              <div className='flex items-center gap-3'>
                <span className='bg-emerald-500/10 text-emerald-500 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold'>
                  {i + 1}
                </span>
                <div className='bg-emerald-500/5 text-emerald-500 flex h-8 w-8 items-center justify-center rounded-lg'>
                  <step.icon className='h-4 w-4' />
                </div>
                <h3 className='text-sm font-semibold'>{t(step.titleKey)}</h3>
              </div>
            </div>

            {/* Desktop connector arrow between cards */}
            {i < STEPS.length - 1 && (
              <ChevronRight className='text-muted-foreground/30 absolute -right-3 top-1/2 hidden h-5 w-5 -translate-y-1/2 sm:block' />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
