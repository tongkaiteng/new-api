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

interface FaqItem {
  question: string
  answer: string
}

export function Faq() {
  const { t } = useTranslation()

  const faqItems: FaqItem[] = [
    {
      question: t('Will my API Key be stored?'),
      answer: t('Will my API Key be stored? answer'),
    },
    {
      question: t('Which protocols are supported?'),
      answer: t('Which protocols are supported? answer'),
    },
    {
      question: t('Why use browser-direct instead of server proxy?'),
      answer: t('Why use browser-direct answer'),
    },
    {
      question: t('Can I test my own custom models?'),
      answer: t('Can I test my own custom models? answer'),
    },
    {
      question: t('What if the test fails?'),
      answer: t('What if the test fails? answer'),
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-base'>{t('FAQ')}</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        {faqItems.map((item, i) => (
          <div key={i}>
            <h3 className='mb-1 text-sm font-medium'>{item.question}</h3>
            <p className='text-muted-foreground text-sm'>{item.answer}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
