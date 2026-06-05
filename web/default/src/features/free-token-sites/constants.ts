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
import type { TFunction } from 'i18next'
import { z } from 'zod'
import { FREE_TOKEN_SITE_STATUS } from './types'

export { FREE_TOKEN_SITE_STATUS }

export const SUCCESS_MESSAGES = {
  SITE_CREATED: 'Free token site created',
  SITE_UPDATED: 'Free token site updated',
  SITE_DELETED: 'Free token site deleted',
  CODES_ADDED: 'Redemption codes added',
} as const

export function getFreeTokenSiteFormSchema(t: TFunction, isUpdate: boolean) {
  return z.object({
    name: z
      .string()
      .min(1, t('Site name is required'))
      .max(50, t('Site name must be at most 50 characters')),
    description: z.string(),
    site_url: z.string().min(1, t('Site URL is required')),
    logo_url: z.string(),
    bonus: z.string(),
    status: z.number(),
    sort_order: z.coerce.number().int(),
    codes_text: isUpdate
      ? z.string()
      : z
          .string()
          .min(1, t('At least one redemption code is required'))
          .refine(
            (value) =>
              value
                .split(/\r?\n/)
                .map((line) => line.trim())
                .some(Boolean),
            t('At least one redemption code is required')
          ),
  })
}

export const FREE_TOKEN_SITE_FORM_DEFAULT_VALUES = {
  name: '',
  description: '',
  site_url: '',
  logo_url: '',
  bonus: '',
  status: FREE_TOKEN_SITE_STATUS.ENABLED,
  sort_order: 0,
  codes_text: '',
}

export function getFreeTokenSiteStatusOptions(t: TFunction) {
  return [
    { value: FREE_TOKEN_SITE_STATUS.ENABLED, label: t('Enabled') },
    { value: FREE_TOKEN_SITE_STATUS.DISABLED, label: t('Disabled') },
  ]
}

export function parseCodesText(codesText: string): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  for (const line of codesText.split(/\r?\n/)) {
    const code = line.trim()
    if (!code || seen.has(code)) continue
    seen.add(code)
    result.push(code)
  }
  return result
}
