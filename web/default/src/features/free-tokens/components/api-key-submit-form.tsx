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
import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { ArrowLeft, Gift, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { COMMON_MODELS, PROTOCOL_OPTIONS, type FreeApiKeySubmitPayload } from '../types'
import { useSubmitFreeApiKey } from '../hooks/use-free-tokens'
import { useStatus } from '@/hooks/use-status'
import { formatQuota } from '@/lib/format'

const PROTOCOL_HINTS: Record<number, string> = {
  1: 'Compatible with /v1/chat/completions and /v1/models proxy endpoints.',
  2: 'Compatible with /v1/messages, using the Anthropic Message protocol.',
  3: 'Compatible with /v1beta/models/{model}:generateContent.',
  4: 'Only select this when the API does not match any of the above three types.',
}

export function FreeApiKeySubmitForm() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const mutation = useSubmitFreeApiKey()
  const { status } = useStatus()

  const submitReward = (status?.free_api_key_submit_reward as number) ?? 0

  const [apiAddress, setApiAddress] = useState('')
  const [protocol, setProtocol] = useState(1)
  const [apiKey, setApiKey] = useState('')
  const [selectedModels, setSelectedModels] = useState<string[]>([])
  const [customModel, setCustomModel] = useState('')
  const [note, setNote] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const toggleModel = (model: string) => {
    setSelectedModels((prev) =>
      prev.includes(model) ? prev.filter((m) => m !== model) : [...prev, model]
    )
  }

  const selectedProtocolLabel = t(PROTOCOL_OPTIONS.find((o) => o.value === protocol)?.key ?? 'Custom')

  const addCustomModel = () => {
    const trimmed = customModel.trim()
    if (trimmed && !selectedModels.includes(trimmed)) {
      setSelectedModels((prev) => [...prev, trimmed])
      setCustomModel('')
    }
  }

  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!apiAddress.trim()) errs.apiAddress = t('API address is required')
    if (!apiKey.trim()) errs.apiKey = t('API key is required')
    if (selectedModels.length === 0)
      errs.models = t('At least one model is required')
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    const payload: FreeApiKeySubmitPayload = {
      api_address: apiAddress.trim(),
      protocol,
      api_key: apiKey.trim(),
      models: selectedModels.join(', '),
      note: note.trim(),
    }
    try {
      const result = await mutation.mutateAsync(payload)
      if (result.success) {
        toast.success(t('API Key submitted successfully'))
        navigate({ to: '/free-tokens/api-keys' })
      } else {
        toast.error(result.message || t('Submission failed'))
      }
    } catch {
      toast.error(t('Submission failed'))
    }
  }

  return (
    <div className='mx-auto max-w-2xl space-y-8'>
      {/* Back link */}
      <button
        type='button'
        onClick={() => navigate({ to: '/free-tokens/api-keys' })}
        className='text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm transition-colors'
      >
        <ArrowLeft className='h-4 w-4' />
        {t('Free API Keys')}
      </button>

      {/* Header */}
      <div className='space-y-2'>
        <h2 className='text-2xl font-bold tracking-tight'>
          {t('Submit API Key')}
        </h2>
        <p className='text-muted-foreground text-sm leading-relaxed'>
          {t('Share your API Key and earn quota rewards when others claim it.')}
        </p>
      </div>

      {/* Reward card */}
      <div className='flex flex-wrap items-center gap-3 rounded-2xl bg-emerald-500 px-5 py-3.5'>
        <div className='flex size-9 items-center justify-center rounded-full bg-white/20'>
          <Gift className='h-5 w-5 text-white' />
        </div>
        <div className='flex items-baseline gap-1.5'>
          <span className='text-sm text-white/80'>
            {t('Submission Reward')}
          </span>
          <span className='text-lg font-bold text-white'>
            +{submitReward > 0 ? formatQuota(submitReward) : '-'}
          </span>
        </div>
        <span className='text-xs text-white/60'>
          {t('Rewards will be added directly to your balance')}
        </span>
      </div>

      {/* Form fields */}
      <div className='space-y-6'>
        {/* API 地址 */}
        <div>
          <label className='text-sm font-medium'>
            {t('API Address')} <span className='text-destructive'>*</span>
          </label>
          <Input
            value={apiAddress}
            onChange={(e) => setApiAddress(e.target.value)}
            placeholder='https://api.openai.com'
            className='mt-2'
          />
          {errors.apiAddress && (
            <p className='text-destructive mt-1.5 text-xs'>{errors.apiAddress}</p>
          )}
        </div>

        {/* 协议格式 */}
        <div>
          <label className='text-sm font-medium'>
            {t('Protocol Format')} <span className='text-destructive'>*</span> <p className='text-muted-foreground mt-1.5 text-xs'>一般选择 OpenAI v1 格式；只有明确是 Anthropic 或 Gemini 格式时再切换。</p>
          </label>
          <Select
            value={String(protocol)}
            onValueChange={(v) => setProtocol(Number(v))}
          >
            <SelectTrigger className='mt-2 w-full'>
              <span>{selectedProtocolLabel}</span>
            </SelectTrigger>
            <SelectContent>
              {PROTOCOL_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={String(opt.value)}>
                  {t(opt.key)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className='text-muted-foreground mt-1.5 text-xs'>
            {t(PROTOCOL_HINTS[protocol] ?? '')}
          </p>
        </div>

        {/* API Key */}
        <div>
          <label className='text-sm font-medium'>
            {t('API Key')} <span className='text-destructive'>*</span>
          </label>
          <Input
            type='password'
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder='sk-...'
            className='mt-2'
          />
          {errors.apiKey && (
            <p className='text-destructive mt-1.5 text-xs'>{errors.apiKey}</p>
          )}
        </div>

        {/* 支持模型 */}
        <div>
          <label className='text-sm font-medium'>
            {t('Supported Models')} <span className='text-destructive'>*</span>
          </label>
          <div className='mt-2 flex flex-wrap gap-1.5'>
            {COMMON_MODELS.map((model) => (
              <Badge
                key={model}
                variant={selectedModels.includes(model) ? 'default' : 'outline'}
                className='cursor-pointer'
                onClick={() => toggleModel(model)}
              >
                {model}
              </Badge>
            ))}
          </div>
          <div className='mt-2 flex gap-2'>
            <Input
              value={customModel}
              onChange={(e) => setCustomModel(e.target.value)}
              placeholder={t('Custom model...') as string}
              className='h-8 text-sm'
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addCustomModel()
                }
              }}
            />
            <Button
              type='button'
              variant='outline'
              size='sm'
              className='h-8 shrink-0'
              onClick={addCustomModel}
            >
              {t('Add')}
            </Button>
          </div>
          {selectedModels.length > 0 && (
            <div className='mt-2 flex flex-wrap gap-1'>
              {selectedModels.map((model) => (
                <Badge key={model} variant='secondary' className='gap-1'>
                  {model}
                  <X
                    className='h-3 w-3 cursor-pointer'
                    onClick={() => toggleModel(model)}
                  />
                </Badge>
              ))}
            </div>
          )}
          {errors.models && (
            <p className='text-destructive mt-1.5 text-xs'>{errors.models}</p>
          )}
        </div>

        {/* 备注说明 */}
        <div>
          <label className='text-sm font-medium'>{t('Note')}</label>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={
              t(
                'e.g. For testing only; limited daily quota; supports text models.'
              ) as string
            }
            rows={3}
            className='mt-2'
          />
        </div>
      </div>

      {/* Submit button — right-aligned pill */}
      <div className='flex justify-end'>
        <Button
          className='min-w-[140px] rounded-full bg-emerald-500 text-white hover:bg-emerald-600'
          size='lg'
          disabled={mutation.isPending}
          onClick={handleSubmit}
        >
          {mutation.isPending ? t('Submitting...') : t('Submit')}
        </Button>
      </div>
    </div>
  )
}
