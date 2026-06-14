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

import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface IssueItem {
  code: string
  cause: string
  solution: string
}

export function Troubleshooting() {
  const { t } = useTranslation()

  const issues: IssueItem[] = [
    {
      code: '401',
      cause: t('401 Unauthorized'),
      solution: t('401 solution'),
    },
    {
      code: '403',
      cause: t('403 Forbidden'),
      solution: t('403 solution'),
    },
    {
      code: '429',
      cause: t('429 Too Many Requests'),
      solution: t('429 solution'),
    },
    {
      code: 'CORS',
      cause: t('Failed to fetch / CORS'),
      solution: t('CORS solution'),
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-base'>
          {t('Common Issues & Solutions')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='bg-muted/60 border-b'>
                <th className='px-3 py-2 text-left font-medium'>{t('Status Code')}</th>
                <th className='px-3 py-2 text-left font-medium'>原因</th>
                <th className='px-3 py-2 text-left font-medium'>解决办法</th>
              </tr>
            </thead>
            <tbody>
              {issues.map((issue) => (
                <tr key={issue.code} className='border-b last:border-b-0'>
                  <td className='px-3 py-2.5'>
                    <code className='bg-muted rounded px-1.5 py-0.5 text-xs font-mono font-semibold text-red-600 dark:text-red-400'>
                      {issue.code}
                    </code>
                  </td>
                  <td className='text-muted-foreground px-3 py-2.5'>{issue.cause}</td>
                  <td className='text-muted-foreground px-3 py-2.5'>{issue.solution}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
