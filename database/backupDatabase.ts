import { type DatabaseSync, backup } from 'node:sqlite'
import { debuglog } from 'node:util'

import { DEBUG_NAMESPACE } from '../debug.config.js'
import {
  backupFolder,
  getDatabaseConnection,
  sunriseDB
} from '../helpers/database.helpers.js'

const debug = debuglog(`${DEBUG_NAMESPACE}:database:backupDatabase`)

export async function backupDatabase(
  connectedDatabase?: DatabaseSync
): Promise<false | string> {
  const databasePathSplit = sunriseDB.split(/[/\\]/)

  const backupDatabasePath = `${backupFolder}/${databasePathSplit.at(-1)}.${Date.now().toString()}`

  const database = connectedDatabase ?? getDatabaseConnection()

  try {
    const result = await backup(database, backupDatabasePath)

    if (result > 0) {
      debug('Database backup completed successfully:', backupDatabasePath)
      return backupDatabasePath
    }

    debug('Database backup incomplete:', result, 'pages remaining')

    return false
  } catch (error) {
    debug('Error backing up database:', error)
    return false
  } finally {
    if (connectedDatabase === undefined) {
      database.close()
    }
  }
}
