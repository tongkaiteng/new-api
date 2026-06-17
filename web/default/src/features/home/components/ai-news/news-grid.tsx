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

import { ExternalLink } from 'lucide-react'
import type { AINewsItem } from '../../types'

interface NewsGridProps {
  articles: AINewsItem[]
}

export function NewsGrid({ articles }: NewsGridProps) {
  if (articles.length === 0) {
    return (
      <p className='text-muted-foreground py-8 text-center text-sm'>
        暂无新闻数据
      </p>
    )
  }

  return (
    <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
      {articles.map((article, i) => (
        <a
          key={i}
          href={article.link}
          target='_blank'
          rel='noopener noreferrer'
          className='hover:bg-muted/30 group block rounded-lg border p-4 transition-colors'
        >
          <div className='mb-2 flex items-center gap-2'>
            <span className='text-muted-foreground text-[11px] font-medium'>{article.source}</span>
            <span className='text-muted-foreground/50 text-[11px]'>
              {article.pub_date ? new Date(article.pub_date).toLocaleDateString() : ''}
            </span>
          </div>
          <h3 className='mb-1 text-sm font-medium leading-snug group-hover:text-primary transition-colors'>
            {article.title}
          </h3>
          <ExternalLink className='text-muted-foreground/30 mt-2 h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity' />
        </a>
      ))}
    </div>
  )
}
