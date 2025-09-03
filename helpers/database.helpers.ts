import fs from 'node:fs/promises'
import path from 'node:path'

import Debug from 'debug'

import { DEBUG_NAMESPACE, PROCESS_ID_MAX_DIGITS } from '../debug.config.js'

import { getConfigProperty } from './config.helpers.js'

const debug = Debug(
  `${DEBUG_NAMESPACE}:helpers:database:${process.pid.toString().padEnd(PROCESS_ID_MAX_DIGITS)}`
)

export const useTestDatabases =
  getConfigProperty('application.useTestDatabases') ||
  process.env.TEST_DATABASES === 'true'

if (useTestDatabases) {
  debug('Using "-testing" databases.')
}

export const sunriseDBLive = 'data/sunrise.db'
export const sunriseDBTesting = 'data/sunrise-testing.db'

export const sunriseDB = useTestDatabases ? sunriseDBTesting : sunriseDBLive

export const backupFolder = 'data/backups'

export function sanitizeLimit(limit: number | string): number {
  const limitNumber = Number(limit)

  if (Number.isNaN(limitNumber) || limitNumber < 0) {
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    return 50
  }

  return Math.floor(limitNumber)
}

export function sanitizeOffset(offset: number | string): number {
  const offsetNumber = Number(offset)

  if (Number.isNaN(offsetNumber) || offsetNumber < 0) {
    return 0
  }

  return Math.floor(offsetNumber)
}

export async function getLastBackupDate(): Promise<Date | undefined> {
  let lastBackupDate: Date | undefined

  const filesInBackup = await fs.readdir(backupFolder)

  for (const file of filesInBackup) {
    if (!file.includes('.db.')) {
      continue
    }

    const filePath = path.join(backupFolder, file)

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const stats = await fs.stat(filePath)

    if (
      lastBackupDate === undefined ||
      stats.mtime.getTime() > lastBackupDate.getTime()
    ) {
      lastBackupDate = stats.mtime
    }
  }

  return lastBackupDate
}
