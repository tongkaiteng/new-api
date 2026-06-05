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
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import {
  sideDrawerContentClassName,
  sideDrawerFooterClassName,
  sideDrawerFormClassName,
  sideDrawerHeaderClassName,
} from '@/components/drawer-layout'
import {
  createFreeTokenSite,
  getFreeTokenSiteAdmin,
  updateFreeTokenSite,
} from '../api'
import {
  FREE_TOKEN_SITE_FORM_DEFAULT_VALUES,
  SUCCESS_MESSAGES,
  getFreeTokenSiteFormSchema,
  getFreeTokenSiteStatusOptions,
} from '../constants'
import type { FreeTokenSite } from '../types'
import { useFreeTokenSitesContext } from './free-token-sites-provider'

type FreeTokenSitesMutateDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: FreeTokenSite
}

export function FreeTokenSitesMutateDrawer(
  props: FreeTokenSitesMutateDrawerProps
) {
  const { open, onOpenChange, currentRow } = props
  const { t } = useTranslation()
  const isUpdate = Boolean(currentRow)
  const { triggerRefresh } = useFreeTokenSitesContext()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [codeStats, setCodeStats] = useState({ total: 0, available: 0 })
  const statusOptions = getFreeTokenSiteStatusOptions(t)
  const formSchema = useMemo(
    () => getFreeTokenSiteFormSchema(t, isUpdate),
    [t, isUpdate]
  )

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: FREE_TOKEN_SITE_FORM_DEFAULT_VALUES,
  })

  useEffect(() => {
    if (!open) return
    if (isUpdate && currentRow) {
      getFreeTokenSiteAdmin(currentRow.id).then((result) => {
        if (result.success && result.data) {
          setCodeStats({
            total: result.data.total_count,
            available: result.data.available_count,
          })
          form.reset({
            name: result.data.name,
            description: result.data.description,
            site_url: result.data.site_url,
            logo_url: result.data.logo_url,
            bonus: result.data.bonus,
            status: result.data.status,
            sort_order: result.data.sort_order,
            codes_text: '',
          })
        }
      })
      return
    }
    setCodeStats({ total: 0, available: 0 })
    form.reset(FREE_TOKEN_SITE_FORM_DEFAULT_VALUES)
  }, [open, isUpdate, currentRow, form])

  const onSubmit = async (values: typeof FREE_TOKEN_SITE_FORM_DEFAULT_VALUES) => {
    setIsSubmitting(true)
    try {
      const payload = {
        ...values,
        ...(isUpdate && currentRow ? { id: currentRow.id } : {}),
      }
      const result = isUpdate
        ? await updateFreeTokenSite(payload as typeof payload & { id: number })
        : await createFreeTokenSite(payload)

      if (result.success) {
        toast.success(
          t(isUpdate ? SUCCESS_MESSAGES.SITE_UPDATED : SUCCESS_MESSAGES.SITE_CREATED)
        )
        triggerRefresh()
        onOpenChange(false)
        return
      }
      toast.error(result.message || t('Operation failed'))
    } catch {
      toast.error(t('Operation failed'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className={sideDrawerContentClassName}>
        <SheetHeader className={sideDrawerHeaderClassName}>
          <SheetTitle>
            {isUpdate ? t('Edit free token site') : t('Add free token site')}
          </SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className={sideDrawerFormClassName}
          >
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Site name')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Description')}</FormLabel>
                  <FormControl>
                    <Textarea rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='site_url'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Site URL')}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='https://example.com' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='logo_url'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Logo URL')}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='https://example.com/logo.png' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='bonus'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Bonus label')}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={t('e.g. 1M tokens free')} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {isUpdate ? (
              <div className='bg-muted/40 rounded-lg border p-3 text-sm'>
                <p className='font-medium'>{t('Code pool')}</p>
                <p className='text-muted-foreground mt-1'>
                  {t('{{available}} available / {{total}} total', {
                    available: codeStats.available,
                    total: codeStats.total,
                  })}
                </p>
              </div>
            ) : null}
            <FormField
              control={form.control}
              name='codes_text'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {isUpdate ? t('Add redemption codes') : t('Redemption codes')}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      rows={8}
                      {...field}
                      placeholder={t('Enter one redemption code per line')}
                    />
                  </FormControl>
                  <FormDescription>
                    {isUpdate
                      ? t(
                          'Leave empty to keep the current code pool unchanged. New codes are appended one by one.'
                        )
                      : t(
                          'Each line is a unique code. Users claim them individually until the pool runs out.'
                        )}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='sort_order'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Sort order')}</FormLabel>
                  <FormControl>
                    <Input type='number' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='status'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Status')}</FormLabel>
                  <Select
                    value={String(field.value)}
                    onValueChange={(value) => field.onChange(Number(value))}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={String(option.value)}
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <SheetFooter className={sideDrawerFooterClassName}>
              <SheetClose asChild>
                <Button type='button' variant='outline'>
                  {t('Cancel')}
                </Button>
              </SheetClose>
              <Button type='submit' disabled={isSubmitting}>
                {t('Save')}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
