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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function TerminalGuide() {
  const { t } = useTranslation()

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-base'>{t('How to run in terminal')}</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue='macos'>
          <TabsList className='mb-3'>
            <TabsTrigger value='macos'>{t('macOS / Linux Terminal')}</TabsTrigger>
            <TabsTrigger value='windows'>{t('Windows PowerShell')}</TabsTrigger>
          </TabsList>
          <TabsContent value='macos'>
            <ol className='text-muted-foreground list-decimal space-y-1 pl-5 text-sm'>
              <li>打开终端（Terminal）</li>
              <li>将上方 curl 命令完整复制</li>
              <li>在终端中粘贴并回车执行</li>
              <li>查看返回的 JSON 结果</li>
            </ol>
          </TabsContent>
          <TabsContent value='windows'>
            <ol className='text-muted-foreground list-decimal space-y-1 pl-5 text-sm'>
              <li>按 Win + R 输入 powershell 回车打开</li>
              <li>将上方 curl 命令完整复制</li>
              <li>在 PowerShell 中粘贴并回车执行</li>
              <li>查看返回的 JSON 结果</li>
            </ol>
          </TabsContent>
        </Tabs>
        <p className='text-muted-foreground mt-3 text-xs'>
          {t(
            'If "curl" is not recognized, install it or use an API testing tool like Postman.'
          )}
        </p>
      </CardContent>
    </Card>
  )
}
