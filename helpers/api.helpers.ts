import { randomUUID } from 'node:crypto'

export function generateApiKey(apiKeyPrefix: string): string {
  return `${apiKeyPrefix}-${randomUUID()}-${Date.now().toString()}`
}
