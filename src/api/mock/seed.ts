import type { Address, Currency, Customer, ImportJob, Order, OrderItem, OrderStatus, Product, SalesChannel, Variant } from '@/types/commerce.types'
import type { AutomationRule, Connector, FailedEvent, RuleExecution, SyncJob } from '@/types/integration.types'
import type { Adjustment, LedgerEntry, Lot, MovementType, ReplenishmentSuggestion, Reservation, StockBalance, StockCount, Transfer } from '@/types/inventory.types'
import type { AppNotification, Invoice, WebhookDelivery, WebhookEndpoint } from '@/types/platform.types'
import type { PurchaseOrder, PurchaseOrderStatus, Requisition, Supplier, SupplierReturn } from '@/types/procurement.types'
import type { CarrierAccount, CodRemittance, ReturnRequest, Shipment, ShipmentStatus } from '@/types/shipping.types'
import type { BillableActivity, Client, ClientStatement, RateCard, UsageEntry } from '@/types/threepl.types'
import type { DispatchBatch, Location, PackingSession, PickWave, Receipt, StaffMember, TaskType, Warehouse, WarehouseTask } from '@/types/warehouse.types'
import type { Listing, Storefront } from '@/types/marketplace.types'
import { FX_PER_USD } from '@/constants/regions.constants'
import { createFaker } from './faker'

/**
 * Deterministic demo data for an OMS + WMS tenant in Pakistan and the UAE.
 * Built once; every collection reads its slice so references line up
 * (orders ↔ reservations ↔ shipments ↔ returns, POs ↔ receipts, clients ↔ usage).
 */
const f = createFaker(20261111)
const DAY = 86_400_000
const ago = (days: number) => new Date(Date.now() - days * DAY).toISOString()
const ahead = (days: number) => new Date(Date.now() + days * DAY).toISOString()
const pad = (n: number, w = 4) => String(n).padStart(w, '0')
const meta = (at: string) => ({ createdAt: at, updatedAt: at })
const round = (n: number) => Math.round(n * 100) / 100

const TEAM = ['Ayesha Raza', 'Bilal Ahmed', 'Sara Khan', 'Omar Farooq', 'Hina Malik', 'Faisal Qureshi', 'Rashid Al Mansoori', 'Priya Nair']
const FIRST = ['Ali', 'Fatima', 'Hamza', 'Zainab', 'Usman', 'Ayesha', 'Ahmed', 'Mariam', 'Hassan', 'Sana', 'Imran', 'Noor', 'Khalid', 'Layla', 'Yusuf', 'Amna', 'Saad', 'Huda']
const LAST = ['Khan', 'Ahmed', 'Malik', 'Hussain', 'Sheikh', 'Iqbal', 'Siddiqui', 'Butt', 'Al Hashimi', 'Qureshi', 'Rana', 'Chaudhry', 'Al Suwaidi', 'Javed']
const PK_CITIES = [['Karachi', 'Sindh', ['Gulshan', 'DHA', 'Clifton', 'PECHS', 'North Nazimabad']], ['Lahore', 'Punjab', ['Gulberg', 'DHA', 'Johar Town', 'Model Town']], ['Islamabad', 'ICT', ['F-7', 'G-11', 'E-11']], ['Faisalabad', 'Punjab', ['Peoples Colony', 'Madina Town']], ['Rawalpindi', 'Punjab', ['Saddar', 'Bahria Town']]] as const
const AE_CITIES = [['Dubai', 'Dubai', ['Marina', 'JLT', 'Deira', 'Al Barsha']], ['Abu Dhabi', 'Abu Dhabi', ['Khalidiya', 'Al Reem']], ['Sharjah', 'Sharjah', ['Al Nahda', 'Al Majaz']]] as const

// ---------- master data ----------

const warehouses: Warehouse[] = [
  { id: 'wh-khi', code: 'KHI-01', name: 'Karachi Fulfillment Center', type: 'own', status: 'active', address: 'Plot 14, Korangi Industrial Area', city: 'Karachi', country: 'PK', timezone: 'Asia/Karachi', cutoffTime: '15:00', workingHours: 'Mon–Sat 09:00–21:00', binsCount: 0, utilization: 0.72, staffCount: 6, openTasks: 0, ...meta(ago(400)) },
  { id: 'wh-lhe', code: 'LHE-01', name: 'Lahore Hub', type: 'own', status: 'active', address: 'Sundar Industrial Estate, Raiwind Road', city: 'Lahore', country: 'PK', timezone: 'Asia/Karachi', cutoffTime: '14:00', workingHours: 'Mon–Sat 09:00–19:00', binsCount: 0, utilization: 0.58, staffCount: 4, openTasks: 0, ...meta(ago(300)) },
  { id: 'wh-dxb', code: 'DXB-01', name: 'Dubai South Warehouse', type: 'third_party', status: 'active', address: 'Logistics District, Dubai South', city: 'Dubai', country: 'AE', timezone: 'Asia/Dubai', cutoffTime: '16:00', workingHours: 'Mon–Sat 08:00–20:00', binsCount: 0, utilization: 0.64, staffCount: 4, openTasks: 0, ...meta(ago(200)) },
]

const rateCards: RateCard[] = [
  { id: 'rc-std', name: 'Standard PK 2026', currency: 'PKR', effectiveFrom: ago(120), status: 'active', rates: [{ activity: 'storage', unit: 'bin / day', rate: 25, minimum: 5000 }, { activity: 'receiving', unit: 'unit', rate: 6, minimum: 0 }, { activity: 'putaway', unit: 'unit', rate: 3, minimum: 0 }, { activity: 'pick', unit: 'order line', rate: 18, minimum: 0 }, { activity: 'pack', unit: 'order', rate: 35, minimum: 0 }, { activity: 'dispatch', unit: 'parcel', rate: 20, minimum: 0 }, { activity: 'returns', unit: 'unit', rate: 40, minimum: 0 }], ...meta(ago(120)) },
  { id: 'rc-uae', name: 'UAE Premium', currency: 'AED', effectiveFrom: ago(90), status: 'active', rates: [{ activity: 'storage', unit: 'pallet / day', rate: 3.5, minimum: 500 }, { activity: 'receiving', unit: 'carton', rate: 4, minimum: 0 }, { activity: 'pick', unit: 'unit', rate: 1.2, minimum: 0 }, { activity: 'pack', unit: 'order', rate: 3, minimum: 0 }, { activity: 'dispatch', unit: 'parcel', rate: 2, minimum: 0 }, { activity: 'vas', unit: 'unit', rate: 1.5, minimum: 0 }], ...meta(ago(90)) },
  { id: 'rc-draft', name: 'High volume 2027 (draft)', currency: 'PKR', effectiveFrom: ahead(50), status: 'draft', rates: [{ activity: 'storage', unit: 'bin / day', rate: 20, minimum: 8000 }, { activity: 'pick', unit: 'order line', rate: 14, minimum: 0 }, { activity: 'pack', unit: 'order', rate: 28, minimum: 0 }], ...meta(ago(5)) },
]

const clients: Client[] = [
  ['cl-01', 'GLW', 'Glow Beauty Co.', 'Mahnoor Iqbal', 'rc-std', 'active', ['Karachi Fulfillment Center']],
  ['cl-02', 'URB', 'UrbanThreads', 'Danish Ali', 'rc-std', 'active', ['Karachi Fulfillment Center', 'Lahore Hub']],
  ['cl-03', 'DSR', 'Desert Rose Perfumes', 'Rashid Al Mansoori', 'rc-uae', 'active', ['Dubai South Warehouse']],
  ['cl-04', 'KDZ', 'KidzPlay Toys', 'Sana Javed', 'rc-std', 'onboarding', ['Lahore Hub']],
  ['cl-05', 'FIT', 'FitFuel Nutrition', 'Omar Siddiqui', 'rc-uae', 'suspended', ['Dubai South Warehouse']],
].map(([id, code, name, contact, rateCardId, status, whs], i) => ({
  id: id as string, code: code as string, name: name as string, contactName: contact as string,
  email: `ops@${(name as string).toLowerCase().replace(/[^a-z]+/g, '')}.com`, phone: `+92 300 ${pad(1200000 + i * 4111, 7)}`,
  status: status as Client['status'], warehouseNames: whs as string[], rateCardId: rateCardId as string,
  rateCardName: rateCards.find((r) => r.id === rateCardId)!.name, billingCycle: i % 2 ? 'biweekly' : 'monthly',
  skuCount: 0, unitsStored: 0, ordersMtd: 0, slaOnTime: round(0.86 + f.rand() * 0.13), ...meta(ago(250 - i * 30)),
}))

const suppliers: Supplier[] = [
  ['Al-Karam Textiles', 'Karachi', 'PK', 'PKR'], ['Gul Ahmed Fabrics', 'Karachi', 'PK', 'PKR'], ['Shan Packaging', 'Lahore', 'PK', 'PKR'], ['Nishat Apparel', 'Faisalabad', 'PK', 'PKR'],
  ['Emirates Fragrance Trading', 'Dubai', 'AE', 'AED'], ['Gulf Cosmetics FZE', 'Sharjah', 'AE', 'AED'], ['Shenzhen Toys Mfg', 'Shenzhen', 'CN', 'USD'], ['Prime Nutrition LLC', 'Abu Dhabi', 'AE', 'AED'],
].map(([name, city, country, currency], i) => ({
  id: `sup-${pad(i + 1, 2)}`, code: `SUP-${pad(i + 1, 3)}`, name, contactName: `${f.pick(FIRST)} ${f.pick(LAST)}`,
  email: `sales@${name.toLowerCase().replace(/[^a-z]+/g, '')}.com`, phone: country === 'PK' ? `+92 21 ${pad(f.int(1000000, 9999999), 7)}` : `+971 4 ${pad(f.int(1000000, 9999999), 7)}`,
  city, country, currency: currency as Currency, paymentTerms: f.pick(['Net 30', 'Net 45', 'Net 15', 'Advance']), leadTimeDays: f.int(5, 30),
  status: i === 6 ? 'inactive' : 'active', onTimeRate: round(0.7 + f.rand() * 0.28), openOrders: 0, ...meta(ago(300 - i * 10)),
}))

// Catalog: [title, brand, category, basePrice PKR, cost ratio, sizes?, supplierIdx, clientIdx]
const CATALOG: [string, string, string, number, number, string[] | null, number, number | null][] = [
  ['Classic Crew T-Shirt', 'UrbanThreads', 'Apparel', 2500, 0.42, ['S', 'M', 'L', 'XL'], 3, 1],
  ['Slim Fit Chino', 'UrbanThreads', 'Apparel', 4800, 0.45, ['30', '32', '34'], 3, 1],
  ['Linen Kurta', 'UrbanThreads', 'Apparel', 6200, 0.4, ['M', 'L'], 0, 1],
  ['Lawn 3-Piece Suit', 'Gul Ahmed', 'Apparel', 7800, 0.5, null, 1, null],
  ['Embroidered Shawl', 'Gul Ahmed', 'Apparel', 5400, 0.48, null, 1, null],
  ['Hooded Sweatshirt', 'UrbanThreads', 'Apparel', 5900, 0.44, ['M', 'L', 'XL'], 3, 1],
  ['Vitamin C Serum 30ml', 'Glow Beauty', 'Beauty', 3200, 0.3, null, 5, 0],
  ['Hydrating Face Wash', 'Glow Beauty', 'Beauty', 1450, 0.32, null, 5, 0],
  ['Matte Lipstick', 'Glow Beauty', 'Beauty', 1800, 0.25, ['Ruby', 'Nude', 'Berry'], 5, 0],
  ['SPF 50 Sunscreen', 'Glow Beauty', 'Beauty', 2600, 0.35, null, 5, 0],
  ['Oud Royale EDP 100ml', 'Desert Rose', 'Fragrance', 24000, 0.38, null, 4, 2],
  ['Amber Musk EDP 50ml', 'Desert Rose', 'Fragrance', 14500, 0.4, null, 4, 2],
  ['Bakhoor Gift Set', 'Desert Rose', 'Fragrance', 9800, 0.42, null, 4, 2],
  ['Building Blocks 500pc', 'KidzPlay', 'Toys', 6900, 0.5, null, 6, 3],
  ['Remote Control Car', 'KidzPlay', 'Toys', 8500, 0.55, null, 6, 3],
  ['Plush Teddy Bear', 'KidzPlay', 'Toys', 2900, 0.4, ['Small', 'Large'], 6, 3],
  ['Whey Protein 2lb', 'FitFuel', 'Nutrition', 11500, 0.6, ['Chocolate', 'Vanilla'], 7, 4],
  ['Pre-Workout 300g', 'FitFuel', 'Nutrition', 7200, 0.55, null, 7, 4],
  ['Shaker Bottle', 'FitFuel', 'Nutrition', 1200, 0.3, null, 7, 4],
  ['Kraft Mailer Box M', 'Shan Pack', 'Packaging', 85, 0.6, null, 2, null],
  ['Bubble Mailer A4', 'Shan Pack', 'Packaging', 45, 0.55, null, 2, null],
  ['Leather Wallet', 'Nishat', 'Accessories', 3900, 0.4, ['Black', 'Brown'], 3, null],
  ['Canvas Tote Bag', 'Nishat', 'Accessories', 2200, 0.35, null, 3, null],
  ['Steel Water Bottle', 'Nishat', 'Accessories', 2700, 0.38, null, 3, null],
  ['Skincare Bundle', 'Glow Beauty', 'Beauty', 6500, 0.3, null, 5, 0],
]

const skuOf = (title: string, opt?: string) => `${title.split(/\s+/).map((w) => w.replace(/[^A-Za-z0-9]/g, '').slice(0, 3).toUpperCase()).join('').slice(0, 9)}${opt ? `-${opt.replace(/[^A-Za-z0-9]/g, '').slice(0, 4).toUpperCase()}` : ''}`

const products: Product[] = CATALOG.map(([title, brand, category, price, costRatio, sizes, supIdx, clientIdx], i) => {
  const variants: Variant[] = (sizes ?? [null]).map((opt, j) => ({
    id: `var-${pad(i + 1, 3)}-${j}`, sku: skuOf(title, opt ?? undefined), barcode: `89${pad(i * 10 + j + 100000, 11)}`,
    title: opt ?? 'Default', price, cost: round(price * costRatio), weightKg: round(0.15 + f.rand() * 1.4),
  }))
  const isBundle = title === 'Skincare Bundle'
  return {
    id: `prd-${pad(i + 1, 3)}`, title, brand, category, description: `${title} by ${brand}.`, status: i === 20 ? 'archived' : i === 24 ? 'draft' : 'active',
    type: isBundle ? 'bundle' : sizes ? 'variant' : 'simple', clientId: clientIdx == null ? null : clients[clientIdx].id, clientName: clientIdx == null ? null : clients[clientIdx].name,
    supplierId: suppliers[supIdx].id, supplierName: suppliers[supIdx].name, imageUrl: null, currency: 'PKR',
    dimensionsCm: { length: f.int(10, 40), width: f.int(8, 30), height: f.int(2, 20) }, variants,
    bundle: isBundle ? [{ sku: skuOf('Vitamin C Serum 30ml'), quantity: 1 }, { sku: skuOf('Hydrating Face Wash'), quantity: 1 }, { sku: skuOf('SPF 50 Sunscreen'), quantity: 1 }] : [],
    lotTracked: ['Beauty', 'Nutrition', 'Fragrance'].includes(category), reorderPoint: f.int(10, 40), onHand: 0, available: 0, ...meta(ago(200 - i * 5)),
  }
})
const variantRows = products.filter((p) => p.type !== 'bundle').flatMap((p) => p.variants.map((v) => ({ product: p, variant: v })))

// ---------- locations and balances ----------

const locations: Location[] = warehouses.flatMap((w) => {
  const bins: Location[] = []
  const add = (code: string, zone: string, type: Location['type'], capacity: number) =>
    bins.push({ id: `loc-${w.code}-${code}`, warehouseId: w.id, warehouseName: w.name, code, zone, type, capacity, used: Math.round(capacity * f.rand() * 0.95), status: f.chance(0.04) ? 'blocked' : 'active', ...meta(w.createdAt) })
  for (const zone of ['A', 'B', 'C']) for (let aisle = 1; aisle <= 3; aisle++) for (let shelf = 1; shelf <= 4; shelf++) add(`${zone}-${pad(aisle, 2)}-${pad(shelf, 2)}`, zone, zone === 'A' ? 'picking' : 'storage', zone === 'A' ? 120 : 400)
  add('RCV-01', 'Dock', 'receiving', 2000)
  add('PCK-01', 'Pack', 'packing', 500)
  add('DSP-01', 'Dock', 'dispatch', 1500)
  add('QTN-01', 'Hold', 'quarantine', 300)
  add('DMG-01', 'Hold', 'damaged', 300)
  w.binsCount = bins.length
  return bins
})
const pickBins = (whId: string) => locations.filter((l) => l.warehouseId === whId && (l.type === 'picking' || l.type === 'storage'))

const balances: StockBalance[] = variantRows.flatMap(({ product, variant }, i) => {
  const whs = product.category === 'Fragrance' || product.category === 'Nutrition' ? [warehouses[2]] : product.category === 'Packaging' ? [warehouses[0], warehouses[1]] : i % 3 === 0 ? [warehouses[0], warehouses[1], warehouses[2]] : [warehouses[0], warehouses[1]]
  return whs.map((w, j) => {
    const onHand = f.chance(0.12) ? f.int(0, 12) : f.int(20, 600)
    const reserved = Math.min(onHand, f.int(0, Math.ceil(onHand * 0.25)))
    const damaged = f.chance(0.2) ? f.int(1, 6) : 0
    const quarantined = f.chance(0.12) ? f.int(1, 10) : 0
    return {
      id: `bal-${pad(i, 3)}-${j}`, sku: variant.sku, productId: product.id, productTitle: `${product.title}${variant.title !== 'Default' ? ` · ${variant.title}` : ''}`,
      warehouseId: w.id, warehouseName: w.name, clientName: product.clientName, binCode: f.pick(pickBins(w.id)).code,
      onHand, reserved, damaged, quarantined, available: Math.max(0, onHand - reserved - damaged - quarantined),
      incoming: f.chance(0.3) ? f.int(20, 200) : 0, inTransit: f.chance(0.1) ? f.int(5, 50) : 0,
      reorderPoint: product.reorderPoint, unitCost: w.id === 'wh-dxb' ? round(variant.cost / 75) : variant.cost, ...meta(ago(f.int(0, 20))),
    }
  })
})
for (const p of products) {
  const rows = balances.filter((b) => b.productId === p.id)
  p.onHand = rows.reduce((n, b) => n + b.onHand, 0)
  p.available = rows.reduce((n, b) => n + b.available, 0)
}

// ---------- channels and customers ----------

const channels: SalesChannel[] = [
  ['ch-web', 'linqworks.pk storefront', 'first_party_storefront', 'connected', 'PKR', 'wh-khi'],
  ['ch-shopify', 'UrbanThreads Shopify', 'shopify', 'connected', 'PKR', 'wh-lhe'],
  ['ch-woo', 'Glow Beauty WooCommerce', 'woocommerce', 'error', 'PKR', 'wh-khi'],
  ['ch-daraz', 'Daraz Mall', 'daraz', 'connected', 'PKR', 'wh-khi'],
  ['ch-noon', 'Noon UAE', 'noon', 'connected', 'AED', 'wh-dxb'],
  ['ch-pos', 'Dolmen Mall kiosk', 'pos', 'connected', 'PKR', 'wh-khi'],
  ['ch-manual', 'Manual orders', 'manual', 'connected', 'PKR', null],
  // Launch markets (UAE, KSA, USA, UK, Australia); appended so index-based seeds above stay stable.
  ['ch-amz-ae', 'Amazon.ae', 'amazon', 'connected', 'AED', 'wh-dxb'],
  ['ch-noon-sa', 'Noon KSA', 'noon', 'connected', 'SAR', 'wh-dxb'],
  ['ch-salla', 'Glow Beauty Salla (KSA)', 'salla', 'connected', 'SAR', 'wh-dxb'],
  ['ch-amz-us', 'Amazon.com (US)', 'amazon', 'connected', 'USD', null],
  ['ch-ebay-uk', 'eBay UK', 'ebay', 'connected', 'GBP', null],
  ['ch-amz-au', 'Amazon.com.au', 'amazon', 'error', 'AUD', null],
].map(([id, name, type, status, currency, whId]) => ({
  id: id as string, name: name as string, type: type as SalesChannel['type'], status: status as SalesChannel['status'], currency: currency as Currency,
  defaultWarehouseId: whId, defaultWarehouseName: warehouses.find((w) => w.id === whId)?.name ?? null,
  orderImport: true, inventorySync: type !== 'manual', fulfillmentCallbacks: type !== 'manual' && type !== 'pos', safetyStock: f.int(0, 5),
  lastSyncAt: type === 'manual' ? null : ago(f.rand() * 0.05), ordersToday: 0, errors24h: status === 'error' ? f.int(4, 20) : f.int(0, 1), ...meta(ago(f.int(60, 300))),
}))

function address(country: 'PK' | 'AE', name: string, phone: string): Address {
  const [city, province, areas] = country === 'PK' ? f.pick(PK_CITIES) : f.pick(AE_CITIES)
  return { name, phone, line1: `House ${f.int(1, 220)}, Street ${f.int(1, 40)}`, area: f.pick(areas), city, province, country }
}

const customers: Customer[] = Array.from({ length: 70 }, (_, i) => {
  const country = i % 6 === 0 ? 'AE' : 'PK'
  const name = `${f.pick(FIRST)} ${f.pick(LAST)}`
  const addr = address(country, name, '')
  return {
    id: `cus-${pad(i + 1, 3)}`, name, email: f.chance(0.75) ? `${name.toLowerCase().replace(/\s+/g, '.')}${i}@mail.com` : null,
    phone: country === 'PK' ? `+92 3${f.int(0, 4)}${f.int(0, 9)} ${pad(f.int(1000000, 9999999), 7)}` : `+971 5${f.int(0, 8)} ${pad(f.int(1000000, 9999999), 7)}`,
    city: addr.city, country, ordersCount: 0, totalSpent: 0, currency: country === 'AE' ? 'AED' : 'PKR', lastOrderAt: null,
    tags: f.some(['vip', 'repeat', 'cod_risk', 'wholesale'], 0, 2), ...meta(ago(f.int(30, 400))),
  }
})

// ---------- orders, reservations, shipments ----------

const STATUS_MIX: [OrderStatus, number][] = [['pending_validation', 6], ['on_hold', 7], ['ready_to_allocate', 12], ['partially_allocated', 4], ['allocated', 14], ['picking', 10], ['packed', 8], ['dispatched', 22], ['delivered', 50], ['delivery_failed', 6], ['returned', 5], ['cancelled', 6]]
const statusPool = STATUS_MIX.flatMap(([s, n]) => Array<OrderStatus>(n).fill(s))
const ALLOCATED: OrderStatus[] = ['allocated', 'picking', 'packed', 'dispatched', 'delivered', 'delivery_failed', 'returned']
const SHIPPED: OrderStatus[] = ['dispatched', 'delivered', 'delivery_failed', 'returned']

const carriers: CarrierAccount[] = [
  ['car-tcs', 'tcs', 'TCS Express', 'PK', ['Overnight', 'Same day', 'Economy']],
  ['car-leo', 'leopards', 'Leopards Courier', 'PK', ['Overnight', 'Detain']],
  ['car-postex', 'postex', 'PostEx', 'PK', ['COD Standard']],
  ['car-trax', 'trax', 'Trax', 'PK', ['Rush', 'Saver']],
  ['car-aramex', 'aramex', 'Aramex UAE', 'AE', ['Domestic Express', 'Priority Parcel']],
  ['car-imile', 'imile', 'iMile', 'AE', ['Standard', 'Next day']],
  ['car-dhl', 'dhl', 'DHL Express', 'AE', ['Express Worldwide']],
].map(([id, carrier, name, country, services], i) => ({
  id: id as string, carrier: carrier as string, name: name as string, accountNumber: `${(carrier as string).toUpperCase()}-${pad(f.int(10000, 99999), 5)}`, country: country as string,
  status: i === 3 ? 'error' : 'connected', mode: i === 6 ? 'sandbox' : 'live', services: services as string[], codSupported: id !== 'car-dhl',
  shipments30d: 0, onTimeRate: round(0.82 + f.rand() * 0.16), ...meta(ago(200)),
}))

const orders: Order[] = []
const reservations: Reservation[] = []
const shipments: Shipment[] = []

for (let i = 0; i < 160; i++) {
  const customer = f.pick(customers)
  const uae = customer.country === 'AE'
  const channel = uae ? channels[4] : f.pick(channels.filter((c) => c.currency === 'PKR'))
  const status = f.pick(statusPool)
  const placedDays = SHIPPED.includes(status) ? f.rand() * 28 + 1 : f.rand() * 3
  const placedAt = ago(placedDays)
  const pool = variantRows.filter(({ product }) => product.status === 'active' && (uae ? ['Fragrance', 'Nutrition', 'Beauty'].includes(product.category) : product.category !== 'Fragrance' && product.category !== 'Packaging'))
  const fx = uae ? 1 / 75 : 1
  const items: OrderItem[] = f.some(pool, 1, 3).map(({ product, variant }) => {
    const quantity = f.int(1, 3)
    const allocated = ALLOCATED.includes(status) ? quantity : status === 'partially_allocated' ? Math.max(0, quantity - 1) : 0
    return { sku: variant.sku, title: `${product.title}${variant.title !== 'Default' ? ` · ${variant.title}` : ''}`, quantity, unitPrice: round(variant.price * fx), allocated, fulfilled: SHIPPED.includes(status) ? quantity : 0 }
  })
  const subtotal = round(items.reduce((n, it) => n + it.quantity * it.unitPrice, 0))
  const discount = f.chance(0.2) ? round(subtotal * 0.1) : 0
  const shipping = uae ? 15 : f.pick([0, 200, 250])
  const tax = uae ? round((subtotal - discount) * 0.05) : 0
  const total = round(subtotal - discount + shipping + tax)
  const paymentMethod = f.chance(uae ? 0.3 : 0.7) ? 'cod' : 'prepaid'
  const warehouse = uae ? warehouses[2] : channel.defaultWarehouseId === 'wh-lhe' ? warehouses[1] : warehouses[0]
  const number = `LW-${10001 + i}`
  const id = `ord-${pad(i + 1)}`
  const productClient = products.find((p) => p.variants.some((v) => v.sku === items[0].sku))
  const timeline: Order['timeline'] = [{ at: placedAt, actor: channel.name, event: 'Order imported', note: `External ID ${channel.type === 'manual' ? '—' : `#${f.int(100000, 999999)}`}` }]
  const step = (event: string, offsetH: number, actor = f.pick(TEAM)) => timeline.push({ at: new Date(new Date(placedAt).getTime() + offsetH * 3_600_000).toISOString(), actor, event })
  if (status !== 'pending_validation') step('Validated', 0.2, 'System')
  if (status === 'on_hold') timeline.push({ at: ago(placedDays * 0.5), actor: 'Automation: High-value COD review', event: 'Placed on hold', note: 'COD order above review threshold' })
  if (ALLOCATED.includes(status)) step(`Allocated to ${warehouse.code}`, 0.5, 'System')
  if (['picking', 'packed', ...SHIPPED].includes(status)) step('Picking started', 3)
  if (['packed', ...SHIPPED].includes(status)) step('Packed', 5)
  if (SHIPPED.includes(status)) step('Dispatched', 8)
  if (status === 'delivered' || status === 'returned') step('Delivered', 40, 'Carrier')
  if (status === 'delivery_failed') step('Delivery failed', 40, 'Carrier')
  if (status === 'returned') step('Return received', 120)
  if (status === 'cancelled') step('Cancelled', 1)

  const order: Order = {
    id, number, externalId: channel.type === 'manual' ? null : `${channel.type === 'shopify' ? '#' : ''}${f.int(100000, 999999)}`, channelId: channel.id, channelName: channel.name,
    customerId: customer.id, customerName: customer.name, customerPhone: customer.phone, customerEmail: customer.email,
    clientId: productClient?.clientId ?? null, clientName: productClient?.clientName ?? null,
    warehouseId: status === 'pending_validation' || status === 'on_hold' ? null : warehouse.id, warehouseName: status === 'pending_validation' || status === 'on_hold' ? null : warehouse.name,
    status, priority: f.chance(0.1) ? 'urgent' : f.chance(0.15) ? 'high' : 'normal', paymentMethod, currency: uae ? 'AED' : 'PKR',
    paymentStatus: paymentMethod === 'prepaid' ? (status === 'returned' ? 'refunded' : 'paid') : status === 'delivered' ? 'cod_collected' : 'cod_pending',
    items, subtotal, discount, shipping, tax, total, shippingAddress: address(uae ? 'AE' : 'PK', customer.name, customer.phone),
    tags: f.some(['gift', 'fragile', 'repeat_customer', 'influencer'], 0, 1), holdReason: status === 'on_hold' ? 'COD order above review threshold' : null,
    shipmentId: null, placedAt, timeline, ...meta(placedAt),
  }
  order.shippingAddress.phone = customer.phone
  orders.push(order)
  customer.ordersCount += 1
  customer.totalSpent = round(customer.totalSpent + total)
  if (!customer.lastOrderAt || customer.lastOrderAt < placedAt) customer.lastOrderAt = placedAt
  if (placedDays < 1) channel.ordersToday += 1

  if (['allocated', 'picking', 'packed', 'partially_allocated'].includes(status)) {
    for (const it of items.filter((x) => x.allocated > 0)) {
      reservations.push({ id: `res-${pad(reservations.length + 1)}`, orderId: id, orderNumber: number, sku: it.sku, warehouseName: warehouse.name, quantity: it.allocated, status: 'active', ...meta(timeline[1]?.at ?? placedAt) })
    }
  }
  if (SHIPPED.includes(status)) {
    const carrier = uae ? f.pick(carriers.slice(4, 6)) : f.pick(carriers.slice(0, 3))
    const shipStatus: ShipmentStatus = status === 'dispatched' ? f.pick(['booked', 'in_transit', 'out_for_delivery'] as const) : status === 'delivery_failed' ? 'delivery_failed' : status === 'returned' ? f.pick(['delivered', 'rto'] as const) : 'delivered'
    const bookedAt = new Date(new Date(placedAt).getTime() + 7 * 3_600_000).toISOString()
    const events = [{ at: bookedAt, status: 'booked', location: warehouse.city, description: 'Shipment booked with carrier' }]
    if (shipStatus !== 'booked') events.push({ at: new Date(new Date(bookedAt).getTime() + 10 * 3_600_000).toISOString(), status: 'in_transit', location: `${warehouse.city} hub`, description: 'Departed origin facility' })
    if (['out_for_delivery', 'delivered', 'delivery_failed', 'rto'].includes(shipStatus)) events.push({ at: new Date(new Date(bookedAt).getTime() + 26 * 3_600_000).toISOString(), status: 'out_for_delivery', location: order.shippingAddress.city, description: 'Out for delivery with rider' })
    if (shipStatus === 'delivered') events.push({ at: new Date(new Date(bookedAt).getTime() + 30 * 3_600_000).toISOString(), status: 'delivered', location: order.shippingAddress.city, description: 'Delivered to consignee' })
    if (shipStatus === 'delivery_failed') events.push({ at: new Date(new Date(bookedAt).getTime() + 30 * 3_600_000).toISOString(), status: 'delivery_failed', location: order.shippingAddress.city, description: f.pick(['Consignee not available', 'Address incomplete', 'Refused by customer']) })
    if (shipStatus === 'rto') events.push({ at: new Date(new Date(bookedAt).getTime() + 90 * 3_600_000).toISOString(), status: 'rto', location: warehouse.city, description: 'Returned to origin' })
    const sid = `shp-${pad(shipments.length + 1)}`
    shipments.push({
      id: sid, number: `SHP-${20001 + shipments.length}`, orderId: id, orderNumber: number, carrierId: carrier.id, carrierName: carrier.name, service: f.pick(carrier.services),
      trackingNumber: `${carrier.carrier.toUpperCase().slice(0, 3)}${f.int(100000000, 999999999)}`, status: shipStatus, packages: f.chance(0.1) ? 2 : 1, weightKg: round(0.3 + f.rand() * 3),
      currency: order.currency, codAmount: paymentMethod === 'cod' ? total : 0, codStatus: paymentMethod !== 'cod' ? 'not_applicable' : shipStatus === 'delivered' ? f.pick(['collected', 'remitted'] as const) : 'pending',
      destinationCity: order.shippingAddress.city, country: order.shippingAddress.country, bookedAt, deliveredAt: shipStatus === 'delivered' ? events[events.length - 1].at : null,
      exception: shipStatus === 'delivery_failed' ? events[events.length - 1].description : null, events, ...meta(bookedAt),
    })
    order.shipmentId = sid
    carrier.shipments30d += 1
  }
}
// Packed orders get a pending shipment waiting for booking.
for (const o of orders.filter((x) => x.status === 'packed').slice(0, 5)) {
  const carrier = o.currency === 'AED' ? carriers[4] : carriers[0]
  const sid = `shp-${pad(shipments.length + 1)}`
  shipments.push({ id: sid, number: `SHP-${20001 + shipments.length}`, orderId: o.id, orderNumber: o.number, carrierId: carrier.id, carrierName: carrier.name, service: carrier.services[0], trackingNumber: null, status: 'pending', packages: 1, weightKg: 1.2, currency: o.currency, codAmount: o.paymentMethod === 'cod' ? o.total : 0, codStatus: o.paymentMethod === 'cod' ? 'pending' : 'not_applicable', destinationCity: o.shippingAddress.city, country: o.shippingAddress.country, bookedAt: null, deliveredAt: null, exception: null, events: [], ...meta(ago(0.2)) })
  o.shipmentId = sid
}
for (const c of clients) c.ordersMtd = orders.filter((o) => o.clientId === c.id).length
for (const c of clients) {
  const rows = balances.filter((b) => b.clientName === c.name)
  c.skuCount = new Set(rows.map((b) => b.sku)).size
  c.unitsStored = rows.reduce((n, b) => n + b.onHand, 0)
}

const codRemittances: CodRemittance[] = Array.from({ length: 8 }, (_, i) => {
  const carrier = carriers[i % 5 === 4 ? 4 : i % 3]
  const collected = round(f.int(150000, 900000) / (carrier.country === 'AE' ? 75 : 1))
  const fees = round(collected * 0.025)
  const status = (['pending', 'received', 'reconciled', 'reconciled', 'disputed', 'reconciled', 'received', 'reconciled'] as const)[i]
  return { id: `cod-${pad(i + 1, 3)}`, number: `REM-${3001 + i}`, carrierName: carrier.name, periodStart: ago(7 * (i + 1)), periodEnd: ago(7 * i), shipmentsCount: f.int(40, 220), currency: carrier.country === 'AE' ? 'AED' : 'PKR', collected, fees, remitted: status === 'pending' ? 0 : status === 'disputed' ? round(collected - fees - f.int(2000, 9000)) : round(collected - fees), status, ...meta(ago(7 * i)) }
})

const returns: ReturnRequest[] = orders.filter((o) => o.status === 'returned' || (o.status === 'delivered' && f.chance(0.15))).map((o, i) => {
  const status = o.status === 'returned' ? f.pick(['inspected', 'completed'] as const) : f.pick(['requested', 'approved', 'received'] as const)
  const it = o.items[0]
  const inspected = status === 'inspected' || status === 'completed'
  const condition = inspected ? f.pick(['sellable', 'sellable', 'damaged', 'wrong_item'] as const) : null
  return {
    id: `ret-${pad(i + 1, 3)}`, number: `RMA-${5001 + i}`, orderId: o.id, orderNumber: o.number, customerName: o.customerName, warehouseName: o.warehouseName ?? warehouses[0].name, status,
    reason: f.pick(['Size does not fit', 'Damaged in transit', 'Wrong item received', 'Changed mind', 'Quality not as expected']),
    items: [{ sku: it.sku, title: it.title, quantity: it.quantity, condition, disposition: status === 'completed' ? (condition === 'sellable' ? 'restock' : 'quarantine') : null }],
    refundStatus: status === 'completed' ? 'refunded' : status === 'requested' ? 'none' : 'pending', refundAmount: round(it.unitPrice * it.quantity), currency: o.currency,
    trackingNumber: status === 'requested' ? null : `RT${f.int(10000000, 99999999)}`, ...meta(ago(f.rand() * 10)),
  }
})

// ---------- inventory documents ----------

const ledger: LedgerEntry[] = Array.from({ length: 240 }, (_, i) => {
  const b = f.pick(balances)
  const type = f.pick<MovementType>(['purchase_receipt', 'reservation', 'reservation', 'reservation_release', 'dispatch', 'dispatch', 'dispatch', 'customer_return', 'adjustment_increase', 'adjustment_decrease', 'damage', 'transfer_dispatch', 'transfer_receipt', 'count_variance'])
  const negative = ['dispatch', 'adjustment_decrease', 'damage', 'transfer_dispatch', 'supplier_return'].includes(type)
  const quantity = (negative ? -1 : 1) * (type === 'purchase_receipt' ? f.int(20, 200) : f.int(1, 6))
  const ref = type === 'purchase_receipt' ? ['receipt', `GRN-${f.int(7001, 7030)}`] : type.startsWith('transfer') ? ['transfer', `TRF-${f.int(4001, 4010)}`] : type.startsWith('adjustment') || type === 'damage' ? ['adjustment', `ADJ-${f.int(6001, 6012)}`] : type === 'count_variance' ? ['stock_count', `CNT-${f.int(8001, 8008)}`] : ['order', f.pick(orders).number]
  return { id: `led-${pad(i + 1)}`, movementType: type, sku: b.sku, warehouseName: b.warehouseName, binCode: b.binCode, quantity, balanceAfter: Math.max(0, b.onHand + f.int(-20, 20)), referenceType: ref[0], referenceNumber: ref[1], actorName: type === 'reservation' || type === 'reservation_release' ? 'System' : f.pick(TEAM), reason: type === 'damage' ? 'Crushed carton' : type.startsWith('adjustment') ? 'Cycle count correction' : null, ...meta(ago(i * 0.12)) }
})

const adjustments: Adjustment[] = Array.from({ length: 12 }, (_, i) => {
  const w = warehouses[i % 3]
  const rows = f.some(balances.filter((b) => b.warehouseId === w.id), 1, 3)
  const reason = f.pick(['damage', 'count_correction', 'found', 'lost', 'expired'] as const)
  const sign = reason === 'found' ? 1 : reason === 'count_correction' ? f.pick([1, -1]) : -1
  const status = i < 3 ? 'pending_approval' : i === 5 ? 'rejected' : 'approved'
  return { id: `adj-${pad(i + 1, 3)}`, number: `ADJ-${6001 + i}`, warehouseId: w.id, warehouseName: w.name, reason, status, lines: rows.map((b) => ({ sku: b.sku, binCode: b.binCode, quantity: sign * f.int(1, 8) })), note: reason === 'damage' ? 'Water damage near dock door' : '', requestedBy: f.pick(TEAM), approvedBy: status === 'approved' ? 'Ayesha Raza' : null, ...meta(ago(i * 2 + 0.3)) }
})

const transfers: Transfer[] = Array.from({ length: 8 }, (_, i) => {
  const from = warehouses[i % 2]
  const to = warehouses[(i + 1) % 2]
  const status = (['draft', 'in_transit', 'in_transit', 'received', 'received', 'received', 'cancelled', 'received'] as const)[i]
  const lines = f.some(balances.filter((b) => b.warehouseId === from.id), 1, 4).map((b) => {
    const quantity = f.int(10, 60)
    return { sku: b.sku, quantity, received: status === 'received' ? quantity - (f.chance(0.2) ? 1 : 0) : 0 }
  })
  return { id: `trf-${pad(i + 1, 3)}`, number: `TRF-${4001 + i}`, fromWarehouseId: from.id, fromWarehouseName: from.name, toWarehouseId: to.id, toWarehouseName: to.name, status, lines, dispatchedAt: status === 'draft' || status === 'cancelled' ? null : ago(i * 3 + 2), receivedAt: status === 'received' ? ago(i * 3) : null, note: '', ...meta(ago(i * 3 + 3)) }
})

const stockCounts: StockCount[] = Array.from({ length: 8 }, (_, i) => {
  const w = warehouses[i % 3]
  const zone = f.pick(['A', 'B', 'C'])
  const status = (['scheduled', 'in_progress', 'submitted', 'approved', 'approved', 'scheduled', 'submitted', 'approved'] as const)[i]
  const lines = balances.filter((b) => b.warehouseId === w.id).slice(i, i + 6).map((b) => ({ sku: b.sku, binCode: b.binCode, expected: b.onHand, counted: status === 'scheduled' ? null : status === 'in_progress' && f.chance(0.5) ? null : b.onHand + (f.chance(0.25) ? f.int(-3, 2) : 0) }))
  return { id: `cnt-${pad(i + 1, 3)}`, number: `CNT-${8001 + i}`, warehouseId: w.id, warehouseName: w.name, zone, type: i === 4 ? 'full' : 'cycle', status, lines, assigneeName: f.pick(TEAM), scheduledFor: status === 'scheduled' ? ahead(i + 1) : ago(i), ...meta(ago(i + 2)) }
})

const lots: Lot[] = balances.filter((b) => products.find((p) => p.id === b.productId)?.lotTracked).slice(0, 24).map((b, i) => {
  const expiresIn = f.int(-20, 400)
  return { id: `lot-${pad(i + 1, 3)}`, lotNumber: `L${new Date().getFullYear()}-${pad(f.int(100, 999), 3)}`, sku: b.sku, productTitle: b.productTitle, warehouseName: b.warehouseName, quantity: Math.max(1, Math.round(b.onHand * 0.6)), expiresAt: ahead(expiresIn), status: expiresIn < 0 ? 'expired' : b.quarantined > 0 ? 'quarantined' : 'active', ...meta(ago(f.int(10, 120))) }
})

const replenishment: ReplenishmentSuggestion[] = balances.filter((b) => b.available <= b.reorderPoint).map((b, i) => {
  const product = products.find((p) => p.id === b.productId)!
  return { id: `rpl-${pad(i + 1, 3)}`, sku: b.sku, productTitle: b.productTitle, warehouseName: b.warehouseName, available: b.available, reorderPoint: b.reorderPoint, suggestedQty: Math.max(b.reorderPoint * 3 - b.available - b.incoming, 10), supplierName: product.supplierName, status: i % 7 === 3 ? 'ordered' : 'open', ...meta(ago(f.rand())) }
})

// ---------- procurement ----------

const purchaseOrders: PurchaseOrder[] = Array.from({ length: 22 }, (_, i) => {
  const supplier = suppliers[i % suppliers.length]
  const w = supplier.country === 'AE' ? warehouses[2] : warehouses[i % 2]
  const status: PurchaseOrderStatus = (['draft', 'pending_approval', 'pending_approval', 'approved', 'approved', 'partially_received', 'received', 'closed', 'received', 'cancelled', 'partially_received'] as const)[i % 11]
  const supplied = variantRows.filter(({ product }) => product.supplierId === supplier.id)
  const lines = f.some(supplied.length ? supplied : variantRows, 1, 4).map(({ product, variant }) => {
    const ordered = f.int(4, 40) * 10
    const received = status === 'received' || status === 'closed' ? ordered : status === 'partially_received' ? Math.round(ordered * 0.6) : 0
    const rejected = received ? f.int(0, 3) : 0
    return { sku: variant.sku, title: product.title, ordered, received, accepted: received - rejected, rejected, unitCost: supplier.currency === 'PKR' ? variant.cost : round(variant.cost / (supplier.currency === 'AED' ? 75 : 280)) }
  })
  const subtotal = round(lines.reduce((n, l) => n + l.ordered * l.unitCost, 0))
  const tax = round(subtotal * (supplier.country === 'AE' ? 0.05 : 0.18))
  supplier.openOrders += ['approved', 'partially_received', 'pending_approval'].includes(status) ? 1 : 0
  return { id: `po-${pad(i + 1, 3)}`, number: `PO-${9001 + i}`, supplierId: supplier.id, supplierName: supplier.name, warehouseId: w.id, warehouseName: w.name, status, currency: supplier.currency, expectedAt: ['received', 'closed', 'cancelled'].includes(status) ? ago(i) : ahead(f.int(-2, 20)), lines, subtotal, tax, total: round(subtotal + tax), approvedBy: ['draft', 'pending_approval', 'cancelled'].includes(status) ? null : 'Ayesha Raza', notes: '', ...meta(ago(i * 2 + 1)) }
})

const receipts: Receipt[] = purchaseOrders.filter((po) => ['approved', 'partially_received', 'received', 'closed'].includes(po.status)).map((po, i) => {
  const status = po.status === 'approved' ? 'expected' : po.status === 'partially_received' ? (i % 2 ? 'receiving' : 'inspecting') : 'completed'
  return { id: `grn-${pad(i + 1, 3)}`, number: `GRN-${7001 + i}`, purchaseOrderId: po.id, purchaseOrderNumber: po.number, supplierName: po.supplierName, warehouseId: po.warehouseId, warehouseName: po.warehouseName, status, mode: 'expected', lines: po.lines.map((l) => ({ sku: l.sku, title: l.title, expected: l.ordered, received: l.received, accepted: l.accepted, rejected: l.rejected })), receivedBy: status === 'expected' ? null : f.pick(TEAM), expectedAt: po.expectedAt, ...meta(po.createdAt) }
})

const requisitions: Requisition[] = Array.from({ length: 8 }, (_, i) => ({
  id: `req-${pad(i + 1, 3)}`, number: `REQ-${1101 + i}`, requestedBy: f.pick(TEAM), warehouseName: warehouses[i % 3].name, status: (['submitted', 'submitted', 'approved', 'converted', 'rejected', 'converted', 'approved', 'submitted'] as const)[i],
  lines: f.some(variantRows, 1, 3).map(({ variant }) => ({ sku: variant.sku, quantity: f.int(2, 20) * 10 })), neededBy: ahead(f.int(3, 25)), reason: f.pick(['Below reorder point', 'Eid campaign stock-up', 'New SKU launch', 'Packaging running low']), ...meta(ago(i * 2)),
}))

const supplierReturns: SupplierReturn[] = Array.from({ length: 5 }, (_, i) => {
  const po = purchaseOrders.filter((p) => p.status === 'received')[i % 2]
  return { id: `srt-${pad(i + 1, 3)}`, number: `SRT-${2201 + i}`, supplierName: po.supplierName, purchaseOrderNumber: po.number, status: (['draft', 'shipped', 'credited', 'credited', 'shipped'] as const)[i], lines: [{ sku: po.lines[0].sku, quantity: f.int(2, 12) }], reason: f.pick(['Damaged on arrival', 'Wrong specification', 'Expired stock']), creditAmount: round(po.lines[0].unitCost * f.int(2, 12)), currency: po.currency, ...meta(ago(i * 4)) }
})

// ---------- warehouse execution ----------

const staff: StaffMember[] = [
  ['Imran Shah', 'picker', 0], ['Kashif Ali', 'picker', 0], ['Nadia Perveen', 'packer', 0], ['Zubair Khan', 'receiver', 0], ['Tariq Mehmood', 'dispatcher', 0], ['Sara Khan', 'supervisor', 0],
  ['Waqas Butt', 'picker', 1], ['Rabia Noor', 'packer', 1], ['Asif Javed', 'receiver', 1], ['Hina Malik', 'supervisor', 1],
  ['Joseph Mathew', 'picker', 2], ['Arjun Das', 'packer', 2], ['Mohammed Saleh', 'dispatcher', 2], ['Rashid Al Mansoori', 'supervisor', 2],
].map(([name, role, wi], i) => ({ id: `stf-${pad(i + 1, 2)}`, name: name as string, role: role as StaffMember['role'], warehouseName: warehouses[wi as number].name, status: f.chance(0.75) ? 'on_shift' : 'off_shift', tasksToday: f.int(4, 40), unitsPerHour: f.int(35, 140), accuracy: round(0.95 + f.rand() * 0.049), ...meta(ago(100)) }))

const waves: PickWave[] = Array.from({ length: 9 }, (_, i) => {
  const status = (['planned', 'released', 'picking', 'picking', 'completed', 'completed', 'completed', 'released', 'completed'] as const)[i]
  const unitsTotal = f.int(40, 260)
  return { id: `wav-${pad(i + 1, 3)}`, number: `WAV-${601 + i}`, warehouseName: warehouses[i % 3].name, strategy: f.pick(['batch', 'zone', 'wave', 'single_order'] as const), status, ordersCount: f.int(8, 60), linesCount: f.int(20, 120), unitsPicked: status === 'completed' ? unitsTotal : status === 'picking' ? Math.round(unitsTotal * f.rand()) : 0, unitsTotal, assignees: f.some(staff.filter((s) => s.role === 'picker').map((s) => s.name), 1, 3), cutoffAt: ahead(f.rand() * 0.4 - 0.1), ...meta(ago(i * 0.4)) }
})

const TASK_PLAN: [TaskType, number][] = [['pick', 26], ['putaway', 10], ['pack', 8], ['replenish', 5], ['count', 4], ['move', 4]]
const tasks: WarehouseTask[] = TASK_PLAN.flatMap(([type, n]) => Array.from({ length: n }, () => type)).map((type, i) => {
  const b = f.pick(balances)
  const w = warehouses.find((x) => x.id === b.warehouseId)!
  const order = type === 'pick' || type === 'pack' ? f.pick(orders.filter((o) => ['allocated', 'picking', 'packed'].includes(o.status))) : null
  const status = f.pick(['open', 'open', 'assigned', 'in_progress', 'completed', 'completed', 'exception'] as const)
  const quantity = type === 'putaway' ? f.int(20, 120) : f.int(1, 6)
  const assignee = status === 'open' ? null : f.pick(staff.filter((s) => s.warehouseName === w.name)).name
  const created = ago(f.rand() * 1.5)
  const history = [{ at: created, actor: 'System', event: 'Task created' }]
  if (assignee) history.push({ at: new Date(new Date(created).getTime() + 600_000).toISOString(), actor: 'Sara Khan', event: `Assigned to ${assignee}` })
  if (status === 'in_progress' || status === 'completed' || status === 'exception') history.push({ at: new Date(new Date(created).getTime() + 1_200_000).toISOString(), actor: assignee!, event: `Scanned bin ${b.binCode}` })
  if (status === 'completed') history.push({ at: new Date(new Date(created).getTime() + 1_800_000).toISOString(), actor: assignee!, event: `Confirmed ${quantity} units` })
  if (status === 'exception') history.push({ at: new Date(new Date(created).getTime() + 1_800_000).toISOString(), actor: assignee!, event: 'Short pick reported' })
  return {
    id: `tsk-${pad(i + 1)}`, number: `T-${30001 + i}`, type, status, priority: order?.priority ?? (f.chance(0.15) ? 'high' : 'normal'), warehouseId: w.id, warehouseName: w.name, sku: b.sku, productTitle: b.productTitle, quantity,
    quantityDone: status === 'completed' ? quantity : status === 'exception' ? Math.max(0, quantity - 1) : status === 'in_progress' ? Math.floor(quantity / 2) : 0,
    fromBin: type === 'putaway' ? 'RCV-01' : b.binCode, toBin: type === 'putaway' ? b.binCode : type === 'pick' ? 'PCK-01' : type === 'move' || type === 'replenish' ? f.pick(pickBins(w.id)).code : null,
    orderNumber: order?.number ?? null, waveNumber: type === 'pick' ? f.pick(waves).number : null, assigneeName: assignee, dueAt: ahead(f.rand() * 0.5 - 0.15), exception: status === 'exception' ? 'Bin short by 1 unit' : null, history, ...meta(created),
  }
})
for (const w of warehouses) w.openTasks = tasks.filter((t) => t.warehouseId === w.id && t.status !== 'completed').length

const packing: PackingSession[] = orders.filter((o) => o.status === 'picking' || o.status === 'packed').slice(0, 12).map((o, i) => {
  const status = o.status === 'packed' ? 'packed' : f.pick(['open', 'verified', 'exception'] as const)
  return { id: `pks-${pad(i + 1, 3)}`, orderId: o.id, orderNumber: o.number, warehouseName: o.warehouseName ?? warehouses[0].name, station: `Station ${f.int(1, 4)}`, status, items: o.items.map((it) => ({ sku: it.sku, title: it.title, quantity: it.quantity, verified: status === 'open' ? 0 : status === 'exception' ? Math.max(0, it.quantity - 1) : it.quantity })), packageType: status === 'packed' ? f.pick(['Mailer M', 'Box S', 'Box M']) : null, weightKg: status === 'packed' ? round(0.4 + f.rand() * 2) : null, packerName: f.pick(staff.filter((s) => s.role === 'packer')).name, ...meta(ago(f.rand() * 0.5)) }
})

const dispatchBatches: DispatchBatch[] = Array.from({ length: 8 }, (_, i) => {
  const carrier = carriers[i % 5 === 4 ? 4 : i % 3]
  const list = shipments.filter((s) => s.carrierId === carrier.id).slice(0, f.int(6, 18))
  const status = (['open', 'closed', 'handed_over', 'handed_over', 'handed_over', 'open', 'handed_over', 'handed_over'] as const)[i]
  return { id: `dsp-${pad(i + 1, 3)}`, number: `MAN-${801 + i}`, carrierName: carrier.name, warehouseName: carrier.country === 'AE' ? warehouses[2].name : warehouses[i % 2].name, status, shipmentIds: list.map((s) => s.id), parcels: list.reduce((n, s) => n + s.packages, 0), driverName: status === 'open' ? null : `${f.pick(FIRST)} ${f.pick(LAST)}`, vehicle: status === 'open' ? null : `${f.pick(['KHI', 'LHE', 'DXB'])}-${f.int(1000, 9999)}`, handedOverAt: status === 'handed_over' ? ago(i * 0.8) : null, ...meta(ago(i * 0.8 + 0.2)) }
})

// ---------- 3PL billing ----------

const usage: UsageEntry[] = Array.from({ length: 140 }, (_, i) => {
  const client = clients[i % 4]
  const card = rateCards.find((r) => r.id === client.rateCardId)!
  const rate = f.pick(card.rates)
  const quantity = rate.activity === 'storage' ? f.int(40, 300) : f.int(5, 180)
  return { id: `use-${pad(i + 1)}`, clientId: client.id, clientName: client.name, activity: rate.activity as BillableActivity, quantity, unit: rate.unit, rate: rate.rate, amount: round(quantity * rate.rate), currency: card.currency, reference: rate.activity === 'storage' ? 'Daily storage snapshot' : rate.activity === 'receiving' ? `GRN-${f.int(7001, 7015)}` : f.pick(orders).number, ...meta(ago(i * 0.2)) }
})

const statements: ClientStatement[] = clients.slice(0, 4).flatMap((c, ci) => [0, 1, 2].map((m) => {
  const card = rateCards.find((r) => r.id === c.rateCardId)!
  const status = m === 0 ? 'draft' : m === 1 ? (ci === 1 ? 'overdue' : 'issued') : 'paid'
  return { id: `stm-${ci}-${m}`, number: `INV-${c.code}-${pad(12 - m, 2)}`, clientId: c.id, clientName: c.name, periodStart: ago(30 * (m + 1)), periodEnd: ago(30 * m), currency: card.currency, amount: round(f.int(80000, 450000) / (card.currency === 'AED' ? 75 : 1)), lineCount: f.int(30, 400), status, dueAt: ahead(15 - 30 * m), ...meta(ago(30 * m)) }
}))

// ---------- integrations and automation ----------

const connectors: Connector[] = [
  ['con-shopify', 'shopify', 'storefront', 'UrbanThreads Shopify', 'connected', 'live', 'urbanthreads.myshopify.com', ['Order import', 'Inventory publish', 'Fulfillment ack', 'Product sync'], 'PK'],
  ['con-woo', 'woocommerce', 'storefront', 'Glow Beauty WooCommerce', 'error', 'live', 'glowbeauty.pk', ['Order import', 'Inventory publish'], 'PK'],
  ['con-daraz', 'daraz', 'marketplace', 'Daraz Mall', 'connected', 'live', 'Seller 448812', ['Order import', 'Inventory publish', 'Fulfillment ack'], 'PK'],
  ['con-noon', 'noon', 'marketplace', 'Noon UAE', 'connected', 'live', 'Partner 77123', ['Order import', 'Inventory publish', 'FBN inventory'], 'AE'],
  ['con-amazon', 'amazon', 'marketplace', 'Amazon.ae', 'connected', 'live', 'A2VIGQ35RCS4UG', ['Order import', 'Inventory publish', 'Fulfillment ack', 'Listings'], 'AE'],
  ['con-noon-sa', 'noon', 'marketplace', 'Noon KSA', 'connected', 'live', 'Partner 77124', ['Order import', 'Inventory publish'], 'SA'],
  ['con-salla', 'salla', 'storefront', 'Glow Beauty Salla', 'connected', 'live', 'Store 1180442', ['Order import', 'Inventory publish', 'Product sync'], 'SA'],
  ['con-amazon-us', 'amazon', 'marketplace', 'Amazon.com (US)', 'connected', 'live', 'ATVPDKIKX0DER', ['Order import', 'Inventory publish', 'FBA inventory', 'Listings', 'Repricing'], 'US'],
  ['con-ebay-uk', 'ebay', 'marketplace', 'eBay UK', 'connected', 'live', 'urbanthreads_uk', ['Order import', 'Inventory publish', 'Listings'], 'GB'],
  ['con-amazon-au', 'amazon', 'marketplace', 'Amazon.com.au', 'error', 'live', 'A39IBJ37TRP1C6', ['Order import', 'Inventory publish'], 'AU'],
  ['con-tcs', 'tcs', 'courier', 'TCS Express', 'connected', 'live', 'TCS-48213', ['Booking', 'Labels', 'Tracking', 'COD'], 'PK'],
  ['con-trax', 'trax', 'courier', 'Trax', 'error', 'live', 'TRAX-90122', ['Booking', 'Tracking'], 'PK'],
  ['con-aramex', 'aramex', 'courier', 'Aramex UAE', 'connected', 'live', 'ARX-11873', ['Booking', 'Labels', 'Tracking', 'Rates'], 'AE'],
  ['con-smsa', 'smsa', 'courier', 'SMSA Express', 'connected', 'live', 'SMSA-55102', ['Booking', 'Labels', 'Tracking', 'COD'], 'SA'],
  ['con-royal-mail', 'royal_mail', 'courier', 'Royal Mail Click & Drop', 'connected', 'live', 'RM-883120', ['Labels', 'Tracking', 'Manifests'], 'GB'],
  ['con-whatsapp', 'whatsapp', 'messaging', 'WhatsApp Business', 'connected', 'live', '+971 4 555 0142', ['Order updates', 'COD confirmation'], null],
].map(([id, provider, kind, name, status, mode, account, caps, region]) => ({ id: id as string, provider: provider as string, kind: kind as Connector['kind'], name: name as string, status: status as Connector['status'], mode: mode as Connector['mode'], account: account as string | null, capabilities: caps as string[], region: region as string | null, lastSyncAt: status === 'disconnected' ? null : ago(f.rand() * 0.08), errors24h: status === 'error' ? f.int(5, 30) : f.int(0, 2), ...meta(ago(f.int(30, 200))) }))

const syncJobs: SyncJob[] = Array.from({ length: 45 }, (_, i) => {
  const c = f.pick(connectors.filter((x) => x.status !== 'disconnected'))
  const type = c.kind === 'courier' ? 'tracking_pull' : f.pick(['orders_import', 'inventory_publish', 'product_sync', 'fulfillment_ack'] as const)
  const status = i === 0 ? 'running' : c.status === 'error' && f.chance(0.6) ? 'failed' : f.chance(0.08) ? 'partial' : 'completed'
  const startedAt = ago(i * 0.04)
  return { id: `job-${pad(i + 1)}`, connectorId: c.id, connectorName: c.name, type, status, processed: f.int(0, 240), failed: status === 'failed' ? f.int(1, 30) : status === 'partial' ? f.int(1, 5) : 0, startedAt, finishedAt: status === 'running' ? null : new Date(new Date(startedAt).getTime() + f.int(2, 90) * 1000).toISOString(), ...meta(startedAt) }
})

const failedEvents: FailedEvent[] = Array.from({ length: 16 }, (_, i) => {
  const c = f.pick(connectors.filter((x) => x.status === 'error' || f.chance(0.3)))
  const err = f.pick([['orders/create', 'SKU_NOT_MAPPED', 'SKU "GLW-SERUM-60" has no mapping to a LinqWorks variant'], ['inventory/update', 'INTEGRATION_RATE_LIMITED', '429 Too Many Requests from provider; retry after 60s'], ['orders/updated', 'VALIDATION_ERROR', 'Shipping address city "Khi" not recognised'], ['tracking/pull', 'CARRIER_BOOKING_FAILED', 'Carrier API timeout after 30s'], ['webhook', 'SIGNATURE_INVALID', 'HMAC signature mismatch (body modified or wrong secret)']])
  const status = (i < 9 ? 'failed' : i < 11 ? 'retrying' : i < 14 ? 'resolved' : 'ignored') as FailedEvent['status']
  return { id: `fev-${pad(i + 1, 3)}`, source: c.name, eventType: err[0], externalId: `${f.int(1000000, 9999999)}`, error: `${err[1]}: ${err[2]}`, attempts: f.int(1, 6), status, lastAttemptAt: ago(i * 0.15), payload: JSON.stringify({ id: f.int(1000000, 9999999), topic: err[0], sku: 'GLW-SERUM-60', quantity: 2, customer: { phone: '+92 3•• •••••••' } }, null, 2), ...meta(ago(i * 0.15 + 0.1)) }
})

const rules: AutomationRule[] = [
  { id: 'rul-01', name: 'High-value COD review', description: 'Hold COD orders above PKR 25,000 for a confirmation call.', trigger: 'order_imported', conditions: [{ field: 'payment_method', operator: 'equals', value: 'cod' }, { field: 'order_total', operator: 'greater_than', value: '25000' }], actions: [{ type: 'place_hold', value: 'COD order above review threshold' }, { type: 'add_tag', value: 'cod_review' }], status: 'active', version: 3, runs30d: 0, lastRunAt: ago(0.1), ...meta(ago(90)) },
  { id: 'rul-02', name: 'Route UAE orders to Dubai', description: 'Allocate every order shipping to the UAE from DXB-01.', trigger: 'order_imported', conditions: [{ field: 'destination_country', operator: 'equals', value: 'AE' }], actions: [{ type: 'assign_warehouse', value: 'DXB-01' }], status: 'active', version: 1, runs30d: 0, lastRunAt: ago(0.3), ...meta(ago(80)) },
  { id: 'rul-03', name: 'Lahore orders from LHE-01', description: 'Ship Punjab orders from the Lahore hub.', trigger: 'order_imported', conditions: [{ field: 'destination_city', operator: 'in', value: 'Lahore, Faisalabad, Rawalpindi' }], actions: [{ type: 'assign_warehouse', value: 'LHE-01' }, { type: 'select_shipping_service', value: 'TCS Overnight' }], status: 'active', version: 2, runs30d: 0, lastRunAt: ago(0.2), ...meta(ago(70)) },
  { id: 'rul-04', name: 'Low stock replenishment', description: 'Suggest a purchase order when available stock falls below reorder point.', trigger: 'inventory_below_reorder', conditions: [], actions: [{ type: 'create_replenishment', value: '3x reorder point' }, { type: 'notify_user', value: 'Inventory manager' }], status: 'active', version: 1, runs30d: 0, lastRunAt: ago(1), ...meta(ago(60)) },
  { id: 'rul-05', name: 'Escalate failed deliveries', description: 'Notify support when a delivery fails.', trigger: 'delivery_failed', conditions: [], actions: [{ type: 'notify_user', value: 'Customer support' }, { type: 'add_tag', value: 'delivery_failed' }], status: 'active', version: 1, runs30d: 0, lastRunAt: ago(0.5), ...meta(ago(40)) },
  { id: 'rul-06', name: 'Influencer orders priority', description: 'Expedite orders tagged by marketing.', trigger: 'order_imported', conditions: [{ field: 'customer_tag', operator: 'equals', value: 'influencer' }], actions: [{ type: 'set_priority', value: 'urgent' }], status: 'paused', version: 1, runs30d: 0, lastRunAt: ago(12), ...meta(ago(30)) },
  { id: 'rul-07', name: 'Overdue pick alert', description: 'Alert the warehouse supervisor when a pick task passes due time.', trigger: 'task_overdue', conditions: [{ field: 'warehouse', operator: 'equals', value: 'KHI-01' }], actions: [{ type: 'notify_user', value: 'Sara Khan' }], status: 'draft', version: 1, runs30d: 0, lastRunAt: null, ...meta(ago(3)) },
]
const executions: RuleExecution[] = Array.from({ length: 70 }, (_, i) => {
  const rule = f.pick(rules.filter((r) => r.status !== 'draft'))
  rule.runs30d += f.int(8, 40)
  const result = rule.status === 'paused' ? 'skipped' : f.pick(['success', 'success', 'success', 'skipped', 'failed'] as const)
  return { id: `exe-${pad(i + 1)}`, ruleId: rule.id, ruleName: rule.name, trigger: rule.trigger, subject: rule.trigger === 'inventory_below_reorder' ? f.pick(balances).sku : f.pick(orders).number, result, actionsApplied: result === 'success' ? rule.actions.map((a) => `${a.type}: ${a.value}`) : [], durationMs: f.int(4, 180), error: result === 'failed' ? 'Warehouse DXB-01 has no stock for 1 line; allocation skipped' : null, ...meta(ago(i * 0.2)) }
})

// ---------- platform ----------

const webhooks: WebhookEndpoint[] = [
  { id: 'whk-1', url: 'https://linqworks.pk/api/webhooks/linqworks', description: 'Storefront order status sync', events: ['order.accepted', 'order.dispatched', 'order.delivered', 'order.cancelled', 'shipment.tracking_updated'], status: 'active', secretPrefix: 'whsec_8a1f', successRate: 0.994, lastDeliveryAt: ago(0.02), ...meta(ago(120)) },
  { id: 'whk-2', url: 'https://erp.example.com/hooks/stock', description: 'ERP stock mirror', events: ['inventory.available_changed'], status: 'disabled', secretPrefix: 'whsec_33bc', successRate: 0.81, lastDeliveryAt: ago(4), ...meta(ago(60)) },
]
const deliveries: WebhookDelivery[] = Array.from({ length: 14 }, (_, i) => {
  const ok = i % 6 !== 2
  return { id: `wdl-${pad(i + 1, 3)}`, endpointId: i < 11 ? 'whk-1' : 'whk-2', event: f.pick(webhooks[i < 11 ? 0 : 1].events), statusCode: ok ? 200 : 503, success: ok, attempt: ok ? 1 : f.int(2, 5), durationMs: f.int(80, 900), requestBody: JSON.stringify({ type: 'order.dispatched', order: f.pick(orders).number, tracking: 'TCS482910331' }, null, 2), responseBody: ok ? '{"ok":true}' : 'Service Unavailable', ...meta(ago(i * 0.1)) }
})

const invoices: Invoice[] = Array.from({ length: 6 }, (_, i) => ({ id: `inv-${i + 1}`, number: `LWB-2026-${pad(11 - i, 3)}`, periodStart: ago(30 * (i + 1)), periodEnd: ago(30 * i), amount: 299, currency: 'USD', status: i === 0 ? 'open' : 'paid', ...meta(ago(30 * i)) }))

const notifications: AppNotification[] = [
  { title: 'WooCommerce sync failing', body: 'Glow Beauty WooCommerce returned 401 for 14 requests. Reconnect the store.', type: 'error', link: '/integrations', read: false },
  { title: '3 adjustments need approval', body: 'Stock adjustments are waiting for an inventory approver.', type: 'warning', link: '/adjustments?status=pending_approval', read: false },
  { title: 'Low stock: 9 SKUs', body: 'Available stock is below reorder point. Review replenishment suggestions.', type: 'warning', link: '/replenishment', read: false },
  { title: 'Delivery failed: LW-10093', body: 'Consignee not available. TCS will reattempt tomorrow.', type: 'error', link: '/tracking-exceptions', read: true },
  { title: 'PO-9004 received', body: 'Al-Karam Textiles delivered 360 units to Karachi Fulfillment Center.', type: 'success', link: '/purchase-orders', read: true },
  { title: 'COD remittance disputed', body: 'REM-3005 is short by PKR 6,420 against delivered COD orders.', type: 'warning', link: '/cod-reconciliation', read: true },
].map((n, i) => ({ id: `ntf-${i + 1}`, ...n, type: n.type as AppNotification['type'], ...meta(ago(i * 0.3)) }))

const imports: ImportJob[] = [
  { id: 'imp-1', type: 'products', fileName: 'urbanthreads-catalog-nov.csv', status: 'completed', totalRows: 142, succeeded: 142, failed: 0, createdBy: 'Ayesha Raza', errors: [], ...meta(ago(6)) },
  { id: 'imp-2', type: 'orders', fileName: 'b2b-orders-week45.xlsx', status: 'partial', totalRows: 58, succeeded: 55, failed: 3, createdBy: 'Bilal Ahmed', errors: [{ row: 12, message: 'SKU "TSH-BLK-XXL" not found' }, { row: 31, message: 'Phone number is required for COD orders' }, { row: 44, message: 'Duplicate external order ID 99812' }], ...meta(ago(3)) },
  { id: 'imp-3', type: 'inventory', fileName: 'opening-balances-dxb.csv', status: 'completed', totalRows: 36, succeeded: 36, failed: 0, createdBy: 'Rashid Al Mansoori', errors: [], ...meta(ago(40)) },
]

// ---------- marketplace listings and storefronts ----------

const LISTING_ISSUES = ['Missing GTIN / barcode exemption', 'Image does not meet main-image requirements', 'Price higher than recent selling price (fair pricing)', 'Restricted category: approval required', 'Arabic title missing for Noon']
const listingConnectors = connectors.filter((c) => c.kind === 'marketplace' && c.region && c.region !== 'PK')
const listings: Listing[] = variantRows.slice(0, 36).flatMap(({ product, variant }, i) =>
  listingConnectors.filter((_, ci) => (i + ci) % 3 !== 0).map((c) => {
    const currency = (({ AE: 'AED', SA: 'SAR', US: 'USD', GB: 'GBP', AU: 'AUD' }) as Record<string, Currency>)[c.region!]
    const baseUsd = Math.max(6, (variant.price / FX_PER_USD.PKR) * 3.2)
    const price = Math.round(baseUsd * FX_PER_USD[currency]) - 0.01
    const roll = f.rand()
    const status: Listing['status'] = c.status === 'error' && roll < 0.5 ? 'error' : roll < 0.74 ? 'live' : roll < 0.84 ? 'pending' : roll < 0.93 ? 'suppressed' : 'inactive'
    const units = status === 'live' ? f.int(4, 180) : 0
    return {
      id: `lst-${c.id}-${variant.id}`, productId: product.id, sku: variant.sku, title: variant.title === 'Default' ? product.title : `${product.title} · ${variant.title}`,
      connectorId: c.id, marketplace: c.name, provider: c.provider, region: c.region!, externalId: status === 'pending' ? null : c.provider === 'amazon' ? `B0${f.int(10000000, 99999999)}` : c.provider === 'ebay' ? `${f.int(100000000000, 399999999999)}` : `N${f.int(10000000, 99999999)}A`,
      status, price, currency, publishedQty: status === 'live' ? f.int(3, 120) : 0, fulfilment: f.pick(['merchant', 'linqworks', 'marketplace'] as const),
      buyBoxShare: ['amazon', 'noon'].includes(c.provider) && status === 'live' ? round(0.55 + f.rand() * 0.45) : null,
      unitsSold30d: units, revenue30d: round(units * price), feeRate: c.provider === 'amazon' ? 0.15 : c.provider === 'ebay' ? 0.128 : 0.12,
      issue: status === 'suppressed' || status === 'error' ? f.pick(LISTING_ISSUES) : null, lastSyncedAt: status === 'pending' ? null : ago(f.rand() * 0.2), ...meta(ago(f.int(5, 120))),
    }
  }),
)

const storefronts: Storefront[] = [
  ['sf-ae', 'Glow Beauty UAE', 'glowbeauty.ae', 'AE', 'AED', ['en', 'ar'], 'luxury', '#B4846C', 'published', ['Card', 'Apple Pay', 'Tabby', 'Tamara', 'COD'], true],
  ['sf-sa', 'Glow Beauty KSA', 'glowbeauty.sa', 'SA', 'SAR', ['ar', 'en'], 'luxury', '#B4846C', 'published', ['mada', 'Apple Pay', 'Tabby', 'Tamara', 'COD'], true],
  ['sf-us', 'UrbanThreads US', 'urbanthreads.com', 'US', 'USD', ['en'], 'bold', '#111827', 'published', ['Card', 'Apple Pay', 'PayPal', 'Afterpay'], false],
  ['sf-uk', 'UrbanThreads UK', 'urbanthreads.co.uk', 'GB', 'GBP', ['en'], 'bold', '#111827', 'draft', ['Card', 'Apple Pay', 'PayPal', 'Clearpay'], true],
  ['sf-au', 'KidzPlay Australia', 'kidzplay.com.au', 'AU', 'AUD', ['en'], 'minimal', '#0EA5E9', 'maintenance', ['Card', 'Afterpay', 'PayPal'], true],
].map(([id, name, domain, region, currency, languages, theme, brandColor, status, checkout, taxInclusive], i) => {
  const visitors = status === 'published' ? f.int(8000, 60000) : status === 'maintenance' ? f.int(1000, 4000) : 0
  const conversionRate = round(0.012 + f.rand() * 0.025)
  return {
    id: id as string, name: name as string, domain: domain as string, region: region as string, currency: currency as Currency, languages: languages as string[],
    theme: theme as Storefront['theme'], brandColor: brandColor as string, status: status as Storefront['status'], productsPublished: f.int(18, 60), checkout: checkout as string[],
    visitors30d: visitors, orders30d: Math.round(visitors * conversionRate), conversionRate, taxInclusive: taxInclusive as boolean, ...meta(ago(120 - i * 20)),
  }
})

export const seed = {
  listings, storefronts,
  warehouses, locations, clients, rateCards, suppliers, products, balances, channels, customers, orders, reservations, shipments, carriers,
  codRemittances, returns, ledger, adjustments, transfers, stockCounts, lots, replenishment, purchaseOrders, receipts, requisitions,
  supplierReturns, staff, waves, tasks, packing, dispatchBatches, usage, statements, connectors, syncJobs, failedEvents, rules, executions,
  webhooks, deliveries, invoices, notifications, imports,
}

/** Copy so each workspace starts from pristine rows. */
export const seedOf = <K extends keyof typeof seed>(key: K) => () => structuredClone(seed[key])
