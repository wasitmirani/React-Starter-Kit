import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { tenantsApi } from '@/api/endpoints/tenants.api'
import { errorMessage } from '@/api/errors'
import { resetMockData } from '@/api/mock/collection'
import { env } from '@/config/env.config'
import { PageHeader } from '@/components/common/PageHeader'
import { FormField } from '@/components/common/FormField'
import { Loader } from '@/components/common/Loader'
import { queryKeys, useTenant, useTenantId, useTenantSettings } from '@/hooks/queries/workspace.queries'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { workspaceSettingsSchema, type WorkspaceSettingsSchema } from '@/lib/validation/schemas'

const LOCALES: [string, string][] = [['en', 'English'], ['en-GB', 'English (UK)'], ['de', 'Deutsch'], ['fr', 'Français'], ['es', 'Español'], ['pt-BR', 'Português (Brasil)'], ['ar', 'العربية'], ['ur', 'اردو']]

export function WorkspaceSettingsPage() {
  const tenantId = useTenantId()
  const { can, refreshProfile } = useAuth()
  const canEdit = can('tenant.update')
  const toast = useToast()
  const queryClient = useQueryClient()
  const tenant = useTenant()
  const settings = useTenantSettings()
  const timezones = useMemo(() => Intl.supportedValuesOf('timeZone'), [])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<WorkspaceSettingsSchema>({ resolver: zodResolver(workspaceSettingsSchema) })

  useEffect(() => {
    if (tenant.data && settings.data) {
      reset({ name: tenant.data.name, timezone: settings.data.timezone, locale: settings.data.locale })
    }
  }, [tenant.data, settings.data, reset])

  const onSubmit = handleSubmit(async ({ name, timezone, locale }) => {
    try {
      if (name !== tenant.data?.name) {
        await tenantsApi.update(tenantId, { name })
        await refreshProfile()
      }
      await tenantsApi.updateSettings(tenantId, { timezone, locale })
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.tenant(tenantId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.settings(tenantId) }),
      ])
      toast.success('Workspace settings saved')
    } catch (err) {
      toast.error(errorMessage(err))
    }
  })

  return (
    <>
      <PageHeader title="Workspace" description="Name, time zone and language for this workspace." />
      <div className="card">
        <div className="card-header">
          <h6 className="card-title mb-0">General</h6>
        </div>
        <div className="card-body">
          {tenant.isLoading || settings.isLoading ? (
            <Loader />
          ) : tenant.isError || settings.isError ? (
            <div className="alert alert-danger">{errorMessage(tenant.error ?? settings.error)}</div>
          ) : (
            <form onSubmit={onSubmit} noValidate>
              <fieldset disabled={!canEdit} className="row g-6">
                <FormField id="ws-name" label="Workspace name" error={errors.name?.message} className="col-md-6" required>
                  <input id="ws-name" className={`form-control${errors.name ? ' is-invalid' : ''}`} {...register('name')} />
                </FormField>
                <FormField id="ws-slug" label="Workspace ID" className="col-md-6" hint="Used in API and support requests.">
                  <input id="ws-slug" className="form-control" value={tenant.data?.slug ?? ''} readOnly disabled />
                </FormField>
                <FormField id="ws-timezone" label="Time zone" error={errors.timezone?.message} className="col-md-6"
                  hint="Used for scheduling campaigns and reports.">
                  <select id="ws-timezone" className="form-select" {...register('timezone')}>
                    <option value="UTC">UTC</option>
                    {timezones.map((tz) => (
                      <option key={tz} value={tz}>
                        {tz}
                      </option>
                    ))}
                  </select>
                </FormField>
                <FormField id="ws-locale" label="Default language" error={errors.locale?.message} className="col-md-6" hint="Used for new templates, dates and number formats.">
                  <select id="ws-locale" className="form-select" {...register('locale')}>
                    {LOCALES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    {settings.data?.locale && !LOCALES.some(([v]) => v === settings.data!.locale) && <option value={settings.data.locale}>{settings.data.locale}</option>}
                  </select>
                </FormField>
                {canEdit && (
                  <div className="col-12 d-flex justify-content-end">
                    <button type="submit" className="btn btn-primary" disabled={isSubmitting || !isDirty}>
                      {isSubmitting ? 'Saving…' : 'Save changes'}
                    </button>
                  </div>
                )}
              </fieldset>
            </form>
          )}
        </div>
      </div>
      {env.useMocks && (
        <div className="card mt-4">
          <div className="card-body d-flex flex-wrap align-items-center gap-3">
            <div className="flex-1">
              <h6 className="mb-1">Demo data</h6>
              <p className="text-muted fs-sm mb-0">CRM, campaigns, inbox and channel data in this workspace come from the in-browser demo API until their backend is live. Resetting restores the original sample data.</p>
            </div>
            <button type="button" className="btn btn-light" onClick={resetMockData}>
              <i className="ri-refresh-line me-1" />Reset demo data
            </button>
          </div>
        </div>
      )}
    </>
  )
}
