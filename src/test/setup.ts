import { afterAll, afterEach, beforeAll } from 'vitest'
import { server } from '../mocks/node'

// 每個 Vitest suite 共用 MSW server，測試後重置 handlers 避免案例互相污染。
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
