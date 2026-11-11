import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/common/PageHeader'
import { Panel } from '@/components/common/Panel'
import { CodeSnippet } from '@/components/ui/CodeSnippet'
import { ToneBadge } from '@/components/ui/StatusBadge'
import { env } from '@/config/env.config'
import { ROUTES } from '@/constants/routes.constants'

const BASE = `${env.apiBaseUrl}/channel`

const ENDPOINTS: [method: string, path: string, purpose: string][] = [
  ['POST', '/orders', 'Create or import a first-party order'],
  ['GET', '/orders/{external_order_id}', 'Read the channel order state'],
  ['POST', '/orders/{external_order_id}/cancel', 'Request cancellation'],
  ['GET', '/inventory/availability', 'Available-to-sell per SKU (safety stock applied)'],
  ['GET', '/products', 'Published catalog items'],
  ['GET', '/fulfillments/{external_order_id}', 'Fulfillment, carrier and tracking'],
  ['POST', '/webhook-endpoints', 'Register an outbound webhook endpoint'],
  ['POST', '/webhooks/test', 'Send a signed test event'],
  ['GET', '/events', 'Event delivery history'],
]

const ORDER_BODY = `{
  "channel_order_id": "WEB-100045",
  "currency": "PKR",
  "payment_method": "cod",
  "customer": { "name": "Example Customer", "phone": "+923001234567", "email": "customer@example.com" },
  "shipping_address": { "country": "PK", "province": "Sindh", "city": "Karachi", "area": "Gulshan", "address_line_1": "Example address" },
  "items": [{ "sku": "CLACRETSH-M", "quantity": "2", "unit_price": "2500.00" }],
  "shipping_amount": "200.00",
  "discount_amount": "0.00"
}`

const VERIFY = `import crypto from 'node:crypto'

// Verify over the exact raw body, before parsing JSON.
export function verify(rawBody, timestamp, signature, secret) {
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false // replay window
  const expected = 'sha256=' + crypto.createHmac('sha256', secret).update(\`\${timestamp}.\${rawBody}\`).digest('hex')
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
}`

/** Developer guide for LinqWorks Direct (plan §21): connect your own storefront without a marketplace. */
export function DirectApiPage() {
  const key = `${env.envPrefix}_API_KEY`
  return (
    <>
      <PageHeader
        title="LinqWorks Direct API"
        description="Connect your own website, app, POS or B2B portal. Orders go through the same validation and allocation pipeline as marketplace orders."
        actions={<><Link to={ROUTES.SETTINGS_API_KEYS} className="btn btn-light"><i className="ri-key-2-line me-1" />API keys</Link><Link to={ROUTES.WEBHOOKS} className="btn btn-primary"><i className="ri-webhook-line me-1" />Webhook endpoints</Link></>}
      />
      <div className="row g-4">
        <div className="col-xl-7 d-flex flex-column gap-4">
          <Panel title="Create an order" icon="ri-shopping-bag-3-line" description="Totals are recalculated server-side; a client-supplied grand total is never trusted. Replays with the same Idempotency-Key return the original order.">
            <CodeSnippet
              snippets={[
                { key: 'curl', label: 'cURL', code: `curl -X POST ${BASE}/orders \\\n  -H "Authorization: Bearer $${key}" \\\n  -H "Idempotency-Key: $(uuidgen)" \\\n  -H "Content-Type: application/json" \\\n  -d '${ORDER_BODY.replace(/\n\s*/g, ' ')}'` },
                { key: 'node', label: 'Node.js', code: `const res = await fetch('${BASE}/orders', {\n  method: 'POST',\n  headers: {\n    Authorization: \`Bearer \${process.env.${key}}\`,\n    'Idempotency-Key': crypto.randomUUID(),\n    'Content-Type': 'application/json',\n  },\n  body: JSON.stringify(${ORDER_BODY.replace(/\n/g, '\n  ')}),\n})\nconst { data } = await res.json()` },
                { key: 'php', label: 'PHP', code: `$ch = curl_init('${BASE}/orders');\ncurl_setopt_array($ch, [\n  CURLOPT_POST => true,\n  CURLOPT_RETURNTRANSFER => true,\n  CURLOPT_HTTPHEADER => [\n    'Authorization: Bearer ' . getenv('${key}'),\n    'Idempotency-Key: ' . bin2hex(random_bytes(16)),\n    'Content-Type: application/json',\n  ],\n  CURLOPT_POSTFIELDS => json_encode($order),\n]);\n$response = json_decode(curl_exec($ch), true);` },
              ]}
            />
          </Panel>
          <Panel title="Read stock availability" icon="ri-stack-line" description="Only available-to-sell quantities are exposed (never reserved, damaged or other tenants' stock). Use `updated_at` to ignore stale updates.">
            <CodeSnippet snippets={[{ key: 'curl', label: 'cURL', code: `curl "${BASE}/inventory/availability?sku=CLACRETSH-M" \\\n  -H "Authorization: Bearer $${key}"` }]} />
          </Panel>
          <Panel title="Verify webhook signatures" icon="ri-shield-check-line" description="Outgoing webhooks carry X-LinqWorks-Timestamp and X-LinqWorks-Signature (HMAC SHA-256 over “timestamp.raw_body”).">
            <CodeSnippet snippets={[{ key: 'node', label: 'Node.js', code: VERIFY }]} />
          </Panel>
        </div>
        <div className="col-xl-5 d-flex flex-column gap-4">
          <Panel title="Endpoints" icon="ri-route-line" flush description={<code>{BASE}</code>}>
            <table className="table align-middle mb-0">
              <tbody>
                {ENDPOINTS.map(([method, path, purpose]) => (
                  <tr key={method + path}>
                    <td style={{ width: 70 }}><ToneBadge tone={method === 'GET' ? 'info' : 'success'}>{method}</ToneBadge></td>
                    <td><code className="fs-sm">{path}</code><div className="text-muted fs-sm">{purpose}</div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
          <Panel title="Request headers" icon="ri-file-code-line">
            <CodeSnippet snippets={[{ key: 'h', label: 'Headers', code: `Authorization: Bearer <channel_api_key>\nIdempotency-Key: <unique-request-id>\nX-LinqWorks-Timestamp: <unix-timestamp>\nX-LinqWorks-Signature: sha256=<hex-hmac>` }]} />
            <ul className="text-muted fs-sm mt-3 mb-0 ps-3">
              <li>Keys are per channel, scoped and revocable; the secret is shown once.</li>
              <li>Duplicates are rejected by (tenant, channel, external_order_id).</li>
              <li>Rate limits apply per tenant, channel and key; 429 responses include Retry-After.</li>
              <li>Use a sandbox channel and test SKUs before going live.</li>
            </ul>
          </Panel>
        </div>
      </div>
    </>
  )
}
