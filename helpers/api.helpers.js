import { randomUUID } from 'node:crypto';
export function generateApiKey(apiKeyPrefix) {
    return `${apiKeyPrefix}-${randomUUID()}-${Date.now().toString()}`;
}
