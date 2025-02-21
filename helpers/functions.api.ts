import fs from 'node:fs/promises'

import Debug from 'debug'
import { v4 as uuidV4 } from 'uuid'

import { DEBUG_NAMESPACE } from '../debug.config.js'

const debug = Debug(`${DEBUG_NAMESPACE}:functions.api`)

const apiKeyPath = 'data/apiKeys.json'
let apiKeys: Record<string, string> | undefined

async function loadApiKeys(): Promise<void> {
  try {
    const fileData = await fs.readFile(apiKeyPath, 'utf8')
    apiKeys = JSON.parse(fileData) as Record<string, string>
  } catch (error) {
    debug(error)
    apiKeys = {}
  }
}

async function saveApiKeys(): Promise<void> {
  try {
    await fs.writeFile(apiKeyPath, JSON.stringify(apiKeys), 'utf8')
  } catch (error) {
    debug(error)
  }
}

function generateApiKey(apiKeyPrefix: string): string {
  return `${apiKeyPrefix}-${uuidV4()}-${Date.now().toString()}`
}

export async function regenerateApiKey(userName: string): Promise<void> {
  apiKeys[userName] = generateApiKey(userName)
  await saveApiKeys()
}

export async function getApiKey(userName: string): Promise<string> {
  if (apiKeys === undefined) {
    await loadApiKeys()
  }

  if (!Object.hasOwn(apiKeys, userName)) {
    await regenerateApiKey(userName)
  }

  return apiKeys[userName]
}

export async function getApiKeyFromUser(user: User): Promise<string> {
  return await getApiKey(user.userName)
}

export async function getUserNameFromApiKey(
  apiKey: string
): Promise<string | undefined> {
  if (apiKeys === undefined) {
    await loadApiKeys()
  }

  for (const [userName, currentApiKey] of Object.entries(apiKeys)) {
    if (apiKey === currentApiKey) {
      return userName
    }
  }

  return undefined
}
