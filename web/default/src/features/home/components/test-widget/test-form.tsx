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
import { useTranslation } from 'react-i18next'
import { AlertTriangle, Info, Key, Loader2, Pencil, Play, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { HomepageTestRequest } from '../../types'

interface ModelOption { name: string; id: string }

const PRESET_MODELS: ModelOption[] = [
  { name: 'Opus 4.8', id: 'claude-opus-4-8' },
  { name: 'Opus 4.7', id: 'claude-opus-4-7' },
  { name: 'Opus 4.6', id: 'claude-opus-4-6' },
  { name: 'Sonnet 4.6', id: 'claude-sonnet-4-6' },
  { name: 'GPT 5.5', id: 'gpt-5.5' },
  { name: 'GPT 5.4', id: 'gpt-5.4' },
  { name: 'Gemini 3.1 Pro', id: 'gemini-3.1-pro-preview' },
]

/** Models that do not support cache detection */
const NO_CACHE_MODELS = new Set(['gpt-5.5', 'gpt-5.4', 'gemini-3.1-pro-preview'])

function maskApiKey(key: string): string {
  if (!key) return ''
  if (key.length <= 16) return `${key.slice(0, 4)}...${key.slice(-4)}`
  return `${key.slice(0, 8)}...${key.slice(-8)}`
}

interface TestFormProps {
  onSubmit: (payload: HomepageTestRequest) => void
  isLoading: boolean
}

export function TestForm({ onSubmit, isLoading }: TestFormProps) {
  const { t } = useTranslation()
  const [apiAddress, setApiAddress] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [apiKeyFocused, setApiKeyFocused] = useState(false)
  const apiKeyInputRef = useRef<HTMLInputElement>(null)
  const [refModel, setRefModel] = useState(PRESET_MODELS[0].id)
  const [callModel, setCallModel] = useState(PRESET_MODELS[0].id)
  const [callModelEditing, setCallModelEditing] = useState(false)
  const callModelInputRef = useRef<HTMLInputElement>(null)
  const [cacheDetection, setCacheDetection] = useState(false)

  const selectedModel = useMemo(
    () => PRESET_MODELS.find((m) => m.id === refModel) || PRESET_MODELS[0],
    [refModel],
  )

  const supportsCacheDetection = !NO_CACHE_MODELS.has(refModel)

  const callModelMismatch = callModel !== refModel

  useEffect(() => {
    if (apiKeyFocused && apiKeyInputRef.current) {
      apiKeyInputRef.current.focus()
    }
  }, [apiKeyFocused])

  useEffect(() => {
    if (callModelEditing && callModelInputRef.current) {
      callModelInputRef.current.focus()
      callModelInputRef.current.select()
    }
  }, [callModelEditing])

  const handleModelSelect = (opt: ModelOption) => {
    setRefModel(opt.id)
    setCallModel(opt.id)
    setCallModelEditing(false)
    if (NO_CACHE_MODELS.has(opt.id)) {
      setCacheDetection(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      api_address: apiAddress,
      api_key: apiKey,
      model: callModel || refModel,
      ref_model: refModel,
      cache_detection: supportsCacheDetection ? cacheDetection : false,
    })
  }

  return (
    <Card className='border-border/50 shadow-none'>
      <CardHeader className='pb-3'>
        <CardTitle className='text-base font-semibold tracking-tight'>接口配置</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className='space-y-5'>
          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='space-y-1.5'>
              <Label className='text-xs'>{t('API Address')}</Label>
              <div className='relative'>
                <Search className='absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground' />
                <Input
                  placeholder='https://api.openai.com'
                  value={apiAddress}
                  onChange={(e) => setApiAddress(e.target.value)}
                  required
                  className='h-9 pl-8 text-sm'
                />
              </div>
            </div>
            <div className='space-y-1.5'>
              <Label className='text-xs'>{t('Your API Key')}</Label>
              <div className='relative'>
                <Key className='absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-amber-500 z-10' />
                {apiKeyFocused || !apiKey ? (
                  <Input
                    ref={apiKeyInputRef}
                    type='text'
                    placeholder='sk-...'
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    onBlur={() => setApiKeyFocused(false)}
                    required
                    className='h-9 pl-8 text-sm font-mono'
                  />
                ) : (
                  <div
                    className='border-input flex h-9 w-full cursor-text items-center rounded-md border bg-transparent pl-8 pr-3 text-sm font-mono'
                    onClick={() => setApiKeyFocused(true)}
                  >
                    <span className='truncate'>{maskApiKey(apiKey)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Target Model — tab selection with integrated call-model editing */}
          <div className='space-y-0'>
            <Label className='text-xs mb-2 block'>目标模型</Label>
            <div className='rounded-xl border border-border/50 overflow-hidden'>
              {/* Model selection tabs */}
              <div className='flex flex-wrap gap-1.5 p-2.5 pb-1.5'>
                {PRESET_MODELS.map((opt) => (
                  <button
                    key={opt.id}
                    type='button'
                    onClick={() => handleModelSelect(opt)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                      refModel === opt.id
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                    }`}
                  >
                    {opt.name}
                  </button>
                ))}
              </div>
              {/* Integrated call-model editing row */}
              <div className='flex items-center gap-2 border-t border-border/40 px-3 py-2.5'>
                <span className='text-[11px] text-muted-foreground/70 shrink-0 font-medium'>调用模型</span>
                {callModelEditing ? (
                  <Input
                    ref={callModelInputRef}
                    className='h-7 text-xs font-mono flex-1 border-0 bg-muted/40 focus-visible:ring-1'
                    value={callModel}
                    onChange={(e) => setCallModel(e.target.value)}
                    onBlur={() => setCallModelEditing(false)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === 'Escape') setCallModelEditing(false) }}
                  />
                ) : (
                  <button
                    type='button'
                    onClick={() => setCallModelEditing(true)}
                    className='flex items-center gap-1.5 text-xs font-mono text-foreground/80 hover:text-foreground transition-colors min-w-0 flex-1 justify-start'
                  >
                    <span className='truncate'>{callModel}</span>
                    <Pencil className='h-3 w-3 shrink-0 text-muted-foreground/40' />
                  </button>
                )}
              </div>
              {/* Algorithm scoring hint banner */}
              <div className={`flex items-center gap-2 px-3 py-2 text-[11px] ${
                callModelMismatch
                  ? 'bg-amber-50/70 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400'
                  : 'bg-muted/30 text-muted-foreground'
              }`}>
                {callModelMismatch
                  ? <AlertTriangle className='h-3.5 w-3.5 shrink-0' />
                  : <Info className='h-3.5 w-3.5 shrink-0' />
                }
                <span>
                  {callModelMismatch
                    ? <>检测算法将按 <strong>{selectedModel.name}</strong> 的标准评分，但实际发送的模型ID为 <strong>{callModel}</strong></>
                    : <>按 <strong>{selectedModel.name}</strong> 算法标准评分</>
                  }
                </span>
              </div>
            </div>
          </div>
          <div className='flex items-center justify-between pt-1'>
            <div className='flex items-center gap-2'>
              {supportsCacheDetection && (
                <>
                  <Checkbox id='cache' checked={cacheDetection} onCheckedChange={(v) => setCacheDetection(!!v)} />
                  <Label htmlFor='cache' className='text-xs font-normal cursor-pointer text-muted-foreground'>
                    {t('Enable cache detection (adds ~30s)')}
                  </Label>
                </>
              )}
            </div>
            <Button type='submit' disabled={isLoading} size='sm' className='rounded-full px-5'>
              {isLoading ? <Loader2 className='mr-1.5 h-4 w-4 animate-spin' /> : <Play className='mr-1.5 h-4 w-3.5' />}
              {isLoading ? t('Testing...') : t('Start Detection')}
            </Button>
          </div>
          <p className='text-muted-foreground/60 text-center text-[11px]'>
            {t('Use a dedicated test key for more accurate results')}
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
