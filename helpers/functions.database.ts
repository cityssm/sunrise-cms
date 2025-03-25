import fs from 'node:fs/promises'

import {
  backupFolder,
  sunriseDB as databasePath
} from '../helpers/database.helpers.js'

export async function backupDatabase(): Promise<false | string> {
  const databasePathSplit = databasePath.split(/[/\\]/)

  const backupDatabasePath = `${backupFolder}/${databasePathSplit.at(-1)}.${Date.now().toString()}`

  try {
    await fs.copyFile(databasePath, backupDatabasePath)
    return backupDatabasePath
  } catch {
    return false
  }
}
