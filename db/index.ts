import 'server-only'
import { cache } from 'react'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { detectSsl, isDatabaseConfigured, getActiveDatabaseUrl } from '../lib/db-ssl'

export { isDatabaseConfigured, getActiveDatabaseUrl }

const getClient = cache(() => {
  const url = getActiveDatabaseUrl()
  if (!url) {
    throw new Error('DATABASE_URL is not set or not configured')
  }
  return postgres(url, {
    prepare: false,
    max: 1,
    idle_timeout: 20,
    ssl: detectSsl(url),
  })
})

function getDb() {
  return drizzle(getClient())
}

const noOp = {
  findMany: async () => [],
  findFirst: async () => null,
  findUnique: async () => null,
  create: async (d: any) => d?.data ?? {},
  update: async (d: any) => d?.data ?? {},
  delete: async () => ({}),
}

function createChainableMock(): any {
  const handler: any = {
    get(_target: any, prop: string | symbol) {
      if (prop === 'then') {
        return (resolve: (val: any) => any) => Promise.resolve([]).then(resolve)
      }
      if (prop === 'catch') {
        return (reject: (err: any) => any) => Promise.resolve([]).catch(reject)
      }
      return createChainableMock()
    },
    apply() {
      return createChainableMock()
    },
  }
  return new Proxy(() => {}, handler)
}

// Lazy proxy: the DB connection is only established at runtime (not at build /
// module-eval time) and is resolved per request through `getClient()`.
export const db = new Proxy({} as ReturnType<typeof getDb>, {
  get(_target, prop: string | symbol) {
    if (!isDatabaseConfigured()) {
      return prop === 'query' ? new Proxy({}, { get: () => noOp }) : createChainableMock()
    }
    try {
      return (getDb() as unknown as Record<string | symbol, unknown>)[prop]
    } catch {
      return prop === 'query' ? new Proxy({}, { get: () => noOp }) : createChainableMock()
    }
  },
})

