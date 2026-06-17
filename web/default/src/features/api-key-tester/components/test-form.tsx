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

import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  PROTOCOL_OPTIONS,
  PRESET_MODELS,
  type TestFormState,
} from '../types'

function maskApiKey(key: string): string {
  if (!key) return ''
  if (key.length <= 16) return `${key.slice(0, 4)}...${key.slice(-4)}`
  return `${key.slice(0, 8)}...${key.slice(-8)}`
}

interface TestFormProps {
  onSubmit: (formState: TestFormState) => Promise<void>
  isLoading: boolean
  onChange?: (formState: TestFormState) => void
}

export function TestForm({ onSubmit, isLoading, onChange }: TestFormProps) {
  const { t } = useTranslation()
  const [apiAddress, setApiAddress] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [apiKeyFocused, setApiKeyFocused] = useState(false)
  const apiKeyInputRef = useRef<HTMLInputElement>(null)
  const [model, setModel] = useState(PRESET_MODELS[0])
  const [customModel, setCustomModel] = useState('')
  const [isCustomModel, setIsCustomModel] = useState(false)
  const [protocol, setProtocol] = useState(PROTOCOL_OPTIONS[0].value.toString())
  const [prompt, setPrompt] = useState('')

  useEffect(() => {
    if (apiKeyFocused && apiKeyInputRef.current) {
      apiKeyInputRef.current.focus()
    }
  }, [apiKeyFocused])

  useEffect(() => {
    onChange?.({
      apiAddress,
      apiKey,
      model,
      customModel,
      protocol: parseInt(protocol),
      prompt,
    })
  }, [apiAddress, apiKey, model, customModel, protocol, prompt, onChange])

  const handleModelChange = (value: string) => {
    if (value === '__custom__') {
      setIsCustomModel(true)
      setModel('')
    } else {
      setIsCustomModel(false)
      setModel(value)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const formState: TestFormState = {
      apiAddress,
      apiKey,
      model,
      customModel,
      protocol: parseInt(protocol),
      prompt,
    }
    onSubmit(formState)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-lg'>{t('API Key Tester')}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className='space-y-5'>
          {/* API Address */}
          <div className='space-y-2'>
            <Label htmlFor='api-address'>{t('API Address')}</Label>
            <Input
              id='api-address'
              type='url'
              placeholder={t('API Address placeholder')}
              value={apiAddress}
              onChange={(e) => setApiAddress(e.target.value)}
              required
            />
          </div>

          {/* API Key */}
          <div className='space-y-2'>
            <Label htmlFor='api-key'>{t('Your API Key')}</Label>
            {apiKeyFocused || !apiKey ? (
              <Input
                ref={apiKeyInputRef}
                id='api-key'
                type='text'
                placeholder='sk-...'
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                onBlur={() => setApiKeyFocused(false)}
                required
                className='font-mono'
              />
            ) : (
              <div
                className='border-input flex h-10 w-full cursor-text items-center rounded-md border bg-transparent px-3 text-sm font-mono'
                onClick={() => setApiKeyFocused(true)}
              >
                <span className='truncate'>{maskApiKey(apiKey)}</span>
              </div>
            )}
            <p className='text-muted-foreground text-xs'>
              {t('Only used locally, not sent to server')}
            </p>
          </div>

          {/* Model */}
          <div className='space-y-2'>
            <Label htmlFor='model'>{t('Model')}</Label>
            <Select value={isCustomModel ? '__custom__' : model} onValueChange={handleModelChange}>
              <SelectTrigger id='model'>
                <SelectValue>
                  {isCustomModel ? t('Custom model ID') : model}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {PRESET_MODELS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
                <SelectItem value='__custom__'>{t('Custom model ID')}</SelectItem>
              </SelectContent>
            </Select>
            {isCustomModel && (
              <Input
                className='mt-2'
                placeholder={t('Custom model ID')}
                value={customModel}
                onChange={(e) => setCustomModel(e.target.value)}
                required
              />
            )}
          </div>

          {/* Protocol */}
          <div className='space-y-2'>
            <Label htmlFor='protocol'>{t('AI Protocol Format')}</Label>
            <Select value={protocol} onValueChange={setProtocol}>
              <SelectTrigger id='protocol'>
                <SelectValue>
                  {t(PROTOCOL_OPTIONS.find((o) => o.value.toString() === protocol)?.label || '')}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {PROTOCOL_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value.toString()}>
                    {t(opt.label)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Prompt */}
          <div className='space-y-2'>
            <Label htmlFor='prompt'>{t('Test Prompt')}</Label>
            <Textarea
              id='prompt'
              placeholder={t('Default prompt')}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={2}
            />
          </div>

          {/* Submit */}
          <Button type='submit' className='w-full' disabled={isLoading}>
            {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            {isLoading ? t('Testing...') : t('Test Connectivity')}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
