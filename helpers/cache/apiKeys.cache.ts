import getApiKeys from '../../database/getApiKeys.js'

let apiKeys: Record<string, string> = {}

export function getCachedApiKeys(): Record<string, string> {
  if (Object.keys(apiKeys).length === 0) {
    apiKeys = getApiKeys()
  }
  return apiKeys
}

export function getApiKeyByUsername(username: string): string | undefined {
  const cachedKeys = getCachedApiKeys()

  return cachedKeys[username]
}

export function getUsernameFromApiKey(apiKey: string): string | undefined {
  const cachedKeys = getCachedApiKeys()

  return Object.keys(cachedKeys).find(
    (username) => cachedKeys[username] === apiKey
  )
}

export function clearApiKeysCache(): void {
  apiKeys = {}
}
