import getApiKeys from '../../database/getApiKeys.js'

const cache = {
  apiKeys: {}
}

export function getCachedApiKeys(): Record<string, string> {
  if (Object.keys(cache.apiKeys).length === 0) {
    cache.apiKeys = getApiKeys()
  }
  return cache.apiKeys
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
  cache.apiKeys = {}
}
