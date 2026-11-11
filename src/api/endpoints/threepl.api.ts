import { AppError } from '@/api/errors'
import { latency } from '@/api/mock/collection'
import { db } from '@/api/mock/db'
import { assertStatus } from '@/api/mock/ops'
import { callFor, createResourceApi, http } from '@/api/resource'
import type { Client, ClientStatement, RateCard, UsageEntry } from '@/types/threepl.types'

const call = callFor('threepl')

export const clientsApi = createResourceApi<Client>('/clients', db.clients, {
  decorate: (c) => ({ ...c, rateCardName: db.rateCards.rows().find((r) => r.id === c.rateCardId)?.name ?? null }),
})

export const rateCardsApi = createResourceApi<RateCard>('/rate-cards', db.rateCards)

export const usageApi = createResourceApi<UsageEntry>('/client-billing/usage', db.usage)

export const statementsApi = {
  ...createResourceApi<ClientStatement>('/client-billing/statements', db.statements),
  /** Draft statement from the client's usage ledger for the last 30 days. */
  generate: (clientId: string) =>
    call<ClientStatement>(
      async () => {
        await latency(400, 800)
        const client = db.clients.find(clientId)
        const since = Date.now() - 30 * 86_400_000
        const lines = db.usage.rows().filter((u) => u.clientId === clientId && new Date(u.createdAt).getTime() >= since)
        if (!lines.length) throw new AppError(409, 'NO_USAGE', `${client.name} has no billable usage in the last 30 days.`)
        const count = db.statements.rows().filter((s) => s.clientId === clientId).length
        return db.statements.create({ number: `INV-${client.code}-${String(count + 13).padStart(2, '0')}`, clientId, clientName: client.name, periodStart: new Date(since).toISOString(), periodEnd: new Date().toISOString(), currency: lines[0].currency, amount: Math.round(lines.reduce((n, u) => n + u.amount, 0) * 100) / 100, lineCount: lines.length, status: 'draft', dueAt: new Date(Date.now() + 15 * 86_400_000).toISOString() })
      },
      () => http.post('/client-billing/statements', { clientId }),
    ),
  advance: ({ id, status }: { id: string; status: 'issued' | 'paid' }) =>
    call<ClientStatement>(async () => {
      assertStatus(db.statements.find(id).status, status === 'issued' ? ['draft'] : ['issued', 'overdue'], status === 'issued' ? 'issue' : 'mark paid')
      return db.statements.update(id, { status })
    }, () => http.post(`/client-billing/statements/${id}/${status === 'issued' ? 'issue' : 'mark-paid'}`)),
}
