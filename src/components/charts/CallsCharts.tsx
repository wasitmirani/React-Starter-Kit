import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
} from 'recharts'

export function CallsBarChart({
  data,
}: {
  data: { label: string; value: number; secondary?: number }[]
}) {
  const rows = data.map((d) => ({
    label: d.label,
    total: d.value,
    successful: d.secondary ?? 0,
  }))

  return (
    <div style={{ width: '100%', height: 260 }}>
      <ResponsiveContainer>
        <BarChart data={rows}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis dataKey="label" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="total" fill="var(--primary-color, #5c67f7)" name="Total" />
          <Bar dataKey="successful" fill="#22c55e" name="Successful" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function UsageLineChart({
  data,
}: {
  data: { label: string; value: number }[]
}) {
  return (
    <div style={{ width: '100%', height: 240 }}>
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis dataKey="label" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="value"
            stroke="var(--primary-color, #5c67f7)"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
