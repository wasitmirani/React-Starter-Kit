import { channelsApi } from '@/api/endpoints/commerce.api'
import { suppliersApi } from '@/api/endpoints/procurement.api'
import { carriersApi } from '@/api/endpoints/shipping.api'
import { clientsApi, rateCardsApi } from '@/api/endpoints/threepl.api'
import { staffApi, warehousesApi } from '@/api/endpoints/warehouse.api'
import { useAll } from '@/hooks/queries/resource.queries'
import type { Option } from '@/types/common.types'

/** Small reference lists (≤500 rows, cached 5 min) used by filters and forms. */
export const useWarehouses = () => useAll('warehouses', warehousesApi.list)
export const useSuppliers = () => useAll('suppliers', suppliersApi.list)
export const useCarriers = () => useAll('carriers', carriersApi.list)
export const useChannels = () => useAll('channels', channelsApi.list)
export const useClients = () => useAll('clients', clientsApi.list)
export const useRateCards = () => useAll('rate-cards', rateCardsApi.list)
export const useStaff = () => useAll('staff', staffApi.list)

const toOptions = <T>(rows: T[] | undefined, value: (r: T) => string, label: (r: T) => string): Option[] => (rows ?? []).map((r) => ({ value: value(r), label: label(r) }))

/** Warehouse options by id (forms) or by name (filters on denormalised rows). */
export function useWarehouseOptions(by: 'id' | 'name' = 'id') {
  const q = useWarehouses()
  return toOptions(q.data?.data, (w) => (by === 'id' ? w.id : w.name), (w) => `${w.code} · ${w.name}`)
}

export function useSupplierOptions() {
  return toOptions(useSuppliers().data?.data, (s) => s.id, (s) => s.name)
}

export function useCarrierOptions(by: 'id' | 'name' = 'id') {
  return toOptions(useCarriers().data?.data, (c) => (by === 'id' ? c.id : c.name), (c) => c.name)
}

export function useChannelOptions(by: 'id' | 'name' = 'id') {
  return toOptions(useChannels().data?.data, (c) => (by === 'id' ? c.id : c.name), (c) => c.name)
}

export function useClientOptions() {
  return toOptions(useClients().data?.data, (c) => c.id, (c) => c.name)
}

export function useStaffOptions() {
  return toOptions(useStaff().data?.data, (s) => s.name, (s) => `${s.name} · ${s.role}`)
}
