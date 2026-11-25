import type { DatabaseSync } from 'node:sqlite'
import { debuglog } from 'node:util'

import { DEBUG_NAMESPACE } from '../../debug.config.js'
import { sunriseDB } from '../../helpers/database.helpers.js'

import { hasTableColumn } from './helpers.js'

const debug = debuglog(`${DEBUG_NAMESPACE}:database:upgradeToVersion1`)

export default function upgradeToVersion1(database: DatabaseSync): 1 {
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
