import type { DatabaseSync } from 'node:sqlite'
import { debuglog } from 'node:util'

import { DEBUG_NAMESPACE } from '../../debug.config.js'
import { sunriseDB } from '../../helpers/database.helpers.js'

import {
  getCurrentUserVersion,
  hasTableColumn,
  sqlIndexStatements
} from './helpers.js'

const debug = debuglog(`${DEBUG_NAMESPACE}:database:upgradeDatabase`)

export default function upgradeDatabase(database: DatabaseSync): number {
  let currentVersion = getCurrentUserVersion(database)

  if (currentVersion < 1) {
    currentVersion = updateToVersion1(database)
  }

  if (currentVersion < 2) {
    currentVersion = updateToVersion2(database)
  }

  return currentVersion
}

function updateToVersion1(database: DatabaseSync): 1 {
  const newVersion = 1

  if (!hasTableColumn(database, 'Contracts', 'purchaserCountry')) {
    database.exec(
      'ALTER TABLE Contracts ADD COLUMN purchaserCountry VARCHAR(50)'
    )
  }

  if (!hasTableColumn(database, 'ContractInterments', 'deceasedCountry')) {
    database.exec(
      'ALTER TABLE ContractInterments ADD COLUMN deceasedCountry VARCHAR(50)'
    )
  }

  database.exec(`PRAGMA user_version = ${newVersion}`)

  debug(`Updated ${sunriseDB} to database user version ${newVersion}`)

  return newVersion
}

function updateToVersion2(database: DatabaseSync): 2 {
  const newVersion = 2

  for (const sql of sqlIndexStatements) {
    database.exec(sql)
  }

  database.exec(`PRAGMA user_version = ${newVersion}`)

  debug(`Updated ${sunriseDB} to database user version ${newVersion}`)

  return newVersion
}
