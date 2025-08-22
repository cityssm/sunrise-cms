import sqlite from 'better-sqlite3'
import Debug from 'debug'

import { backupFolder, sunriseDB } from '../helpers/database.helpers.js'

const debug = Debug('sunrise:database:backupDatabase')

export async function backupDatabase(connectedDatabase?: sqlite.Database): Promise<false | string> {
  const databasePathSplit = sunriseDB.split(/[/\\]/)

  const backupDatabasePath = `${backupFolder}/${databasePathSplit.at(-1)}.${Date.now().toString()}`

  const database = connectedDatabase ?? sqlite(sunriseDB)

  try {
    const result = await database.backup(backupDatabasePath)

    if (result.remainingPages === 0) {
      debug('Database backup completed successfully:', backupDatabasePath)
      return backupDatabasePath
    } else {
      debug(
        'Database backup incomplete:',
        result.remainingPages,
        'pages remaining'
      )
      return false
    }
  } catch (error) {
    debug('Error backing up database:', error)
    return false
  } finally {
    if (connectedDatabase === undefined) {

      database.close()

    }
  }
}
