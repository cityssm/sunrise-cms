import getApiKeys from '../../database/getApiKeys.js'

let apiKeys: Record<string, string> = {}

export function getCachedApiKeys(): Record<string, string> {
  if (Object.keys(apiKeys).length === 0) {
    apiKeys = getApiKeys()
  }
  return apiKeys
}

export function getApiKeyByUserName(userName: string): string | undefined {
  const cachedKeys = getCachedApiKeys()

  // eslint-disable-next-line security/detect-object-injection
  return cachedKeys[userName]
}

export function getUserNameFromApiKey(apiKey: string): string | undefined {
  const cachedKeys = getCachedApiKeys()
  
  return Object.keys(cachedKeys).find(
    // eslint-disable-next-line security/detect-object-injection
    (userName) => cachedKeys[userName] === apiKey
  )
}

export function clearApiKeysCache(): void {
  apiKeys = {}
}
