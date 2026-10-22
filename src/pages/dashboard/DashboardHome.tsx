import '@/assets/styles/dashboard-motion.css'
import { WarehouseScene } from '@/components/features/dashboard/WarehouseScene'
import { BuyingRegions } from '@/components/features/dashboard/BuyingRegions'
import { AnimatedProgress } from '@/components/features/dashboard/AnimatedProgress'
import { HrmDashboardSection } from './HrmDashboardSection'

const SPARK = [36, 52, 44, 68, 58, 76, 64, 82, 70, 88]
const FULFILLMENT = [
  { label: 'Orders received', value: '1,248', pct: 100 },
  { label: 'Processing', value: '892', pct: 71.5 },
  { label: 'Packed', value: '721', pct: 57.8 },
  { label: 'Shipped', value: '654', pct: 52.4 },
  { label: 'Delivered', value: '602', pct: 48.2 },
]

const SHIPMENTS = [
  { id: '#OM83291', status: 'Out for delivery', badge: 'success', when: '2h ago' },
  { id: '#OM83290', status: 'In transit', badge: 'info', when: 'Apr 28' },
  { id: '#OM83288', status: 'Label created', badge: 'secondary', when: 'Apr 27' },
  { id: '#OM83287', status: 'Delayed', badge: 'danger', when: 'Apr 26' },
]

const CHANNELS = [
  { name: 'Website', pct: 42, amount: '$28,736', variant: 'warning' as const },
  { name: 'Mobile App', pct: 28, amount: '$19,158', variant: 'success' as const },
  { name: 'Marketplace', pct: 20, amount: '$13,684', variant: 'default' as const },
  { name: 'Social Commerce', pct: 10, amount: '$6,842', variant: 'default' as const },
]

const METRICS = [
  { label: 'Products', value: '1,698', delta: '+6%' },
  { label: 'Customers', value: '982', delta: '+15%' },
  { label: 'Returning', value: '28%', delta: '+4%' },
  { label: 'Delivery', value: '2.8 d', delta: '−18%' },
]

const SALES = [
  { id: '#OM83291', customer: 'Sarah Kim', items: '2 items', amount: '$79.00', time: '2h ago' },
  { id: '#OM83290', customer: 'Michael Tan', items: '1 item', amount: '$24.00', time: '5h ago' },
  { id: '#OM83289', customer: 'Emily Davis', items: '3 items', amount: '$129.00', time: '8h ago' },
  { id: '#OM83288', customer: 'Daniel Lee', items: '1 item', amount: '$49.00', time: '12h ago' },
]

const DELIVERIES = [
  { tracking: 'SPX88291', customer: 'James Wilson', dest: 'New York, NY', status: 'Out for delivery', badge: 'success', eta: 'Today' },
  { tracking: 'J&T76521', customer: 'Aisha Rahman', dest: 'London, UK', status: 'In transit', badge: 'info', eta: 'Apr 28' },
  { tracking: 'DHL11822', customer: 'Chen Wei', dest: 'Singapore', status: 'Delivered', badge: 'success', eta: 'Apr 27' },
  { tracking: 'UPS55210', customer: 'Carlos M.', dest: 'Toronto, CA', status: 'In transit', badge: 'info', eta: 'Apr 27' },
]

function StoreOverviewSection() {
  return (
    <div className="omi-dash">
      <div className="gap-2 page-heading mb-4 flex-column flex-md-row">
        <h6 className="flex-grow-1 mb-0">Store overview</h6>
        <ul className="breadcrumb flex-shrink-0 mb-0">
          <li className="breadcrumb-item">
            <a href="#!">Dashboard</a>
          </li>
          <li className="breadcrumb-item active">Orders</li>
        </ul>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-xl-4 omi-enter">
          <div className="card h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <h6 className="mb-0 text-muted">Total Sales (GMV)</h6>
                <span className="badge bg-success-subtle text-success">↑ 12%</span>
              </div>
              <div className="d-flex justify-content-between align-items-end gap-3 mb-3">
                <h2 className="mb-0 fw-bold">$68,420</h2>
                <div className="omi-spark" aria-hidden style={{ width: 88 }}>
                  {SPARK.map((h, i) => (
                    <span key={i} style={{ height: `${h}%`, animationDelay: `${i * 0.04}s` }} />
                  ))}
                </div>
              </div>
              <div className="row g-2 pt-2 border-top border-opacity-10">
                <div className="col-4">
                  <div className="text-muted fs-12">Orders</div>
                  <strong>1,248</strong>
                </div>
                <div className="col-4">
                  <div className="text-muted fs-12">Conversion</div>
                  <strong>3.2%</strong>
                </div>
                <div className="col-4">
                  <div className="text-muted fs-12">Avg. order</div>
                  <strong>$54.8</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-5 omi-enter omi-enter-delay-1">
          <div className="card h-100">
            <div className="card-body p-2 p-md-3">
              <WarehouseScene />
            </div>
          </div>
        </div>

        <div className="col-xl-3 omi-enter omi-enter-delay-2">
          <div className="card h-100">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h6 className="card-title mb-0">Order Fulfillment</h6>
              <a href="#!" className="fs-12 text-muted">
                View all →
              </a>
            </div>
            <div className="card-body pt-2">
              {FULFILLMENT.map((row, i) => (
                <div className="omi-fulfill-row" key={row.label}>
                  <div className="d-flex justify-content-between mb-1">
                    <span className="fs-13">{row.label}</span>
                    <strong className="fs-13">{row.value}</strong>
                  </div>
                  <AnimatedProgress value={row.pct} delayMs={120 + i * 90} variant="success" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3 mb-3">
        {METRICS.map((m, i) => (
          <div className="col-6 col-lg-3" key={m.label}>
            <div className="omi-metric-tile" style={{ animationDelay: `${0.12 + i * 0.07}s` }}>
              <div className="text-muted fs-12 mb-1">{m.label}</div>
              <div className="d-flex align-items-baseline gap-2">
                <strong className="fs-5 mb-0">{m.value}</strong>
                <span className="text-success fs-12 fw-semibold">{m.delta}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-3 mb-3">
        <div className="col-lg-4 omi-enter omi-enter-delay-2">
          <div className="card h-100">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h6 className="card-title mb-0">Live Shipments</h6>
              <a href="#!" className="fs-12 text-muted">
                View all →
              </a>
            </div>
            <div className="card-body pt-2">
              {SHIPMENTS.map((s, i) => (
                <div
                  className="omi-ship-row d-flex align-items-center justify-content-between gap-2"
                  key={s.id}
                  style={{ animationDelay: `${0.14 + i * 0.08}s` }}
                >
                  <div>
                    <strong className="d-block fs-13">{s.id}</strong>
                    <small className="text-muted">{s.when}</small>
                  </div>
                  <span className={`badge bg-${s.badge}-subtle text-${s.badge}`}>{s.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-lg-4 omi-enter omi-enter-delay-3">
          <div className="card h-100">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h6 className="card-title mb-0">Sales Channels</h6>
              <a href="#!" className="fs-12 text-muted">
                View all →
              </a>
            </div>
            <div className="card-body pt-2">
              {CHANNELS.map((c, i) => (
                <div className="omi-channel-row" key={c.name}>
                  <div className="d-flex justify-content-between mb-1">
                    <span className="fs-13">{c.name}</span>
                    <span>
                      <strong className="fs-13 me-2">{c.pct}%</strong>
                      <span className="text-muted fs-12">{c.amount}</span>
                    </span>
                  </div>
                  <AnimatedProgress value={c.pct} delayMs={180 + i * 90} variant={c.variant} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-lg-4 omi-enter omi-enter-delay-4">
          <div className="card h-100">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h6 className="card-title mb-0">Top Buying Regions</h6>
              <a href="#!" className="fs-12 text-muted">
                View all →
              </a>
            </div>
            <div className="card-body pt-2">
              <BuyingRegions />
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3 mb-2">
        <div className="col-xl-6 omi-enter omi-enter-delay-3">
          <div className="card h-100">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h6 className="card-title mb-0">Recent Sales</h6>
              <a href="#!" className="fs-12 text-muted">
                View all →
              </a>
            </div>
            <div className="card-body pt-2 table-responsive">
              <table className="table table-borderless align-middle mb-0 omi-table-soft">
                <thead>
                  <tr className="text-muted fs-12">
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {SALES.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <strong>{row.id}</strong>
                      </td>
                      <td>{row.customer}</td>
                      <td className="text-muted">{row.items}</td>
                      <td>{row.amount}</td>
                      <td>
                        <span className="badge bg-success-subtle text-success">Paid</span>
                      </td>
                      <td className="text-muted">{row.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-xl-6 omi-enter omi-enter-delay-4">
          <div className="card h-100">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h6 className="card-title mb-0">Recent Deliveries</h6>
              <a href="#!" className="fs-12 text-muted">
                View all →
              </a>
            </div>
            <div className="card-body pt-2 table-responsive">
              <table className="table table-borderless align-middle mb-0 omi-table-soft">
                <thead>
                  <tr className="text-muted fs-12">
                    <th>Tracking</th>
                    <th>Customer</th>
                    <th>Destination</th>
                    <th>Status</th>
                    <th>ETA</th>
                  </tr>
                </thead>
                <tbody>
                  {DELIVERIES.map((row) => (
                    <tr key={row.tracking}>
                      <td>
                        <strong>{row.tracking}</strong>
                      </td>
                      <td>{row.customer}</td>
                      <td className="text-muted">{row.dest}</td>
                      <td>
                        <span className={`badge bg-${row.badge}-subtle text-${row.badge}`}>{row.status}</span>
                      </td>
                      <td className="text-muted">{row.eta}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function DashboardHome() {
  return (
    <>
      <StoreOverviewSection />
      <HrmDashboardSection />
    </>
  )
}
