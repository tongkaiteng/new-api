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

export function FaqSection() {
  return (
    <Card className='border-border/50 shadow-none'>
      <CardHeader>
        <CardTitle className='text-lg font-semibold tracking-tight'>常见问题</CardTitle>
      </CardHeader>
      <CardContent className='space-y-6'>
        <FaqItem
          q='什么是 API 中转站？'
          a='API 中转站是一个代理服务，它将您的请求转发到 AI 提供商的官方 API。通过中转站，您无需直接与每个 AI 提供商对接，只需一个统一的接口即可访问多种模型。'
        />
        <FaqItem
          q='如何挑选靠谱的中转站？'
          a='您可以使用本页面的检测工具对中转站进行多维度评估，包括知识问答校验、型号特征校验、协议一致性和响应结构。同时可以查看中转站排名，选择使用热度高、延迟低的服务。'
        />
        <FaqItem
          q='中转站检测是如何工作的？'
          a='检测工具会向您提供的中转站地址发送多条测试请求，从知识问答能力、模型身份验证、协议规范符合度、响应结构完整性四个维度进行综合评分。所有检测均在服务端执行，您的 API Key 不会被存储。'
        />
        <FaqItem
          q='检测分数是否完全可信？'
          a='检测分数反映了中转站在特定时刻的表现，可作为重要参考，但不能完全代表服务质量。建议结合中转站排名、延迟表现和社区口碑等多方面信息综合判断。'
        />
        <FaqItem
          q='使用中转站有风险吗？'
          a='任何中转站都存在一定风险，包括数据隐私、服务可用性和模型质量等。建议选择信誉良好、透明度高的中转站，避免使用来源不明的服务。本平台排名仅供参考，不构成任何推荐。'
        />
      </CardContent>
    </Card>
  )
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <div className='border-b border-border/30 pb-5 last:border-0 last:pb-0'>
      <h3 className='mb-2 text-sm font-semibold text-foreground'>{q}</h3>
      <p className='text-muted-foreground/80 text-sm leading-relaxed'>{a}</p>
    </div>
  )
}
