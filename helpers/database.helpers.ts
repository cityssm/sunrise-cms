import fs from 'node:fs/promises'

import Debug from 'debug'

import { DEBUG_NAMESPACE } from '../debug.config.js'

import { getConfigProperty } from './config.helpers.js'

const debug = Debug(`${DEBUG_NAMESPACE}:database.helpers`)

export const useTestDatabases =
  getConfigProperty('application.useTestDatabases') ||
  process.env.TEST_DATABASES === 'true'

if (useTestDatabases) {
  debug('Using "-testing" databases.')
}

export const sunriseDBLive = 'data/sunrise.db'
export const sunriseDBTesting = 'data/sunrise-testing.db'

export const sunriseDB = useTestDatabases ? sunriseDBTesting : sunriseDBLive

const backupFolder = 'data/backups'

export async function backupDatabase(): Promise<false | string> {
  const databasePathSplit = sunriseDB.split(/[/\\]/)

  const backupDatabasePath = `${backupFolder}/${databasePathSplit.at(-1)}.${Date.now().toString()}`

  try {
    await fs.copyFile(sunriseDB, backupDatabasePath)
    return backupDatabasePath
  } catch {
    return false
  }
}
