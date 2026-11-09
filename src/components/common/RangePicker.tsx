import { Segmented } from '@/components/ui/Segmented'

const RANGES = [7, 30, 90] as const

/** Last 7 / 30 / 90 days switch used by dashboards and reports. */
export function RangePicker({ value, onChange }: { value: number; onChange: (days: number) => void }) {
  return <Segmented ariaLabel="Date range" value={value} onChange={onChange} options={RANGES.map((d) => ({ value: d, label: `${d}d` }))} />
}
