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
import { useState, useRef, useEffect, useMemo } from 'react'
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
import { Checkbox } from '@/components/ui/checkbox'
import { MODEL_OPTIONS, PROTOCOL_OPTIONS, type FreeApiKeySubmitPayload, type ModelOption } from '../types'
import { useSubmitFreeApiKey } from '../hooks/use-free-tokens'
import { useStatus } from '@/hooks/use-status'
import { useAuthStore } from '@/stores/auth-store'
import { formatQuota } from '@/lib/format'

const PROTOCOL_HINTS: Record<number, string> = {
  1: 'Compatible with /v1/chat/completions and /v1/models proxy endpoints.',
  2: 'Compatible with /v1/messages, using the Anthropic Message protocol.',
  3: 'Compatible with /v1beta/models/{model}:generateContent.',
  4: 'Only select this when the API does not match any of the above three types.',
}

/** Mask API key showing only first and last few characters */
function maskApiKey(key: string): string {
  if (!key) return ''
  if (key.length <= 16) return `${key.slice(0, 4)}...${key.slice(-4)}`
  return `${key.slice(0, 8)}...${key.slice(-8)}`
}

export function FreeApiKeySubmitForm() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const mutation = useSubmitFreeApiKey()
  const { status } = useStatus()
  const isAuthed = Boolean(useAuthStore((s) => s.auth.user))

  const submitReward = (status?.free_api_key_submit_reward as number) ?? 0

  const [apiAddress, setApiAddress] = useState('')
  const [protocol, setProtocol] = useState(1)
  const [apiKey, setApiKey] = useState('')
  const [selectedModels, setSelectedModels] = useState<string[]>([])
  const [customModel, setCustomModel] = useState('')
  const [modelFilter, setModelFilter] = useState('')
  const [note, setNote] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [apiKeyFocused, setApiKeyFocused] = useState(false)
  const apiKeyInputRef = useRef<HTMLInputElement>(null)

  // Auto-focus the input when it enters edit mode
  useEffect(() => {
    if (apiKeyFocused && apiKeyInputRef.current) {
      apiKeyInputRef.current.focus()
    }
  }, [apiKeyFocused])

  const toggleModel = (model: string) => {
    setSelectedModels((prev) =>
      prev.includes(model) ? prev.filter((m) => m !== model) : [...prev, model]
    )
  }

  const filteredModels = modelFilter.trim()
    ? MODEL_OPTIONS.filter(
        (m) =>
          m.title.toLowerCase().includes(modelFilter.toLowerCase()) ||
          m.id.toLowerCase().includes(modelFilter.toLowerCase()) ||
          m.provider.toLowerCase().includes(modelFilter.toLowerCase())
      )
    : MODEL_OPTIONS

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
    if (!isAuthed) {
      navigate({
        to: '/sign-in',
        search: { redirect: '/free-tokens/share' },
      })
      return
    }
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
          <div className='mt-2'>
            {apiKeyFocused || !apiKey ? (
              <Input
                ref={apiKeyInputRef}
                type='text'
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                onFocus={() => setApiKeyFocused(true)}
                onBlur={() => setApiKeyFocused(false)}
                placeholder='sk-...'
              />
            ) : (
              <div
                className='border-input h-8 w-full min-w-0 rounded-lg border bg-transparent px-2.5 py-1 text-sm font-mono cursor-text flex items-center select-none'
                onMouseDown={(e) => {
                  e.preventDefault()
                  setApiKeyFocused(true)
                }}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setApiKeyFocused(true)
                  }
                }}
                role='textbox'
              >
                <span className='truncate'>{maskApiKey(apiKey)}</span>
              </div>
            )}
          </div>
          {errors.apiKey && (
            <p className='text-destructive mt-1.5 text-xs'>{errors.apiKey}</p>
          )}
        </div>

        {/* 支持模型 */}
        <div>
          <label className='text-sm font-medium'>
            {t('Supported Models')} <span className='text-destructive'>*</span>
            {selectedModels.length > 0 && (
              <span className='text-muted-foreground ml-1 font-normal'>
                ({selectedModels.length} {t('selected')})
              </span>
            )}
          </label>
          <div className='mt-2 space-y-2'>
            <Input
              value={modelFilter}
              onChange={(e) => setModelFilter(e.target.value)}
              placeholder={t('Filter models...') as string}
              className='h-8 text-sm'
            />
            <div className='max-h-64 overflow-y-auto rounded-lg border'>
              {filteredModels.map((model: ModelOption) => (
              <div
                key={model.id}
                role='checkbox'
                aria-checked={selectedModels.includes(model.id)}
                tabIndex={0}
                className='hover:bg-accent flex cursor-pointer items-start gap-2.5 border-b px-3 py-2 text-sm last:border-b-0 transition-colors'
                onClick={() => toggleModel(model.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    toggleModel(model.id)
                  }
                }}
              >
                <Checkbox
                  checked={selectedModels.includes(model.id)}
                  onCheckedChange={() => toggleModel(model.id)}
                  className='mt-0.5 shrink-0 pointer-events-none'
                />
                <div className='min-w-0'>
                  <div className='truncate font-medium'>{model.title}</div>
                  <div className='text-muted-foreground truncate text-xs'>
                    {model.id} · {model.provider}
                  </div>
                </div>
              </div>
              ))}
              {filteredModels.length === 0 && (
                <p className='text-muted-foreground py-4 text-center text-sm'>
                  {t('No models match your search')}
                </p>
              )}
          </div>
          </div>
          {selectedModels.length > 0 && (
            <div className='mt-2 flex flex-wrap gap-1'>
              {selectedModels.map((id) => (
                <Badge
                  key={id}
                  variant='secondary'
                  className='gap-1 cursor-pointer'
                  onClick={() => toggleModel(id)}
                >
                  {MODEL_OPTIONS.find((m) => m.id === id)?.title ?? id}
                  <X className='h-3 w-3' />
                </Badge>
              ))}
              </div>
          )}
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
          {mutation.isPending ? t('Checking...') : t('Check & Submit')}
        </Button>
      </div>
    </div>
  )
}
