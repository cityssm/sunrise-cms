/* eslint-disable no-console -- Temp legacy import, not used in production */
/* eslint-disable sonarjs/sql-queries -- Temp legacy import, not used in production */

import sqlite from 'better-sqlite3'
import Debug from 'debug'

import { initializeData } from '../../database/initializeDatabase.js'
import { DEBUG_NAMESPACE } from '../../debug.config.js'
import { clearCaches } from '../../helpers/cache.helpers.js'
import { sunriseDB as databasePath } from '../../helpers/database.helpers.js'

import { initializeContractTypePrints } from './data.contractPrints.js'
import { initializeFuneralHomes } from './data.funeralHomes.js'
import { user } from './utilities.js'

const debug = Debug(`${DEBUG_NAMESPACE}:legacyImportFromCsv`)

function purgeConfigTables(): void {
  console.time('purgeConfigTables')

  const configTablesToPurge = [
    'CemeteryDirectionsOfArrival',
    'Cemeteries',
    'BurialSiteStatuses',
    'CommittalTypes',
    'ServiceTypes',
    'ContractTypeFields',
    'ContractTypePrints',
    'ContractTypes',
    'IntermentContainerTypes',
    'IntermentDepths',
    'WorkOrderMilestoneTypes',
    'WorkOrderTypes'
  ]

  const database = sqlite(databasePath)

  for (const tableName of configTablesToPurge) {
    debug(`Purging table: ${tableName}`)

    database.prepare(`delete from ${tableName}`).run()

    database
      .prepare('delete from sqlite_sequence where name = ?')
      .run(tableName)
  }

  database.close()

  clearCaches()
  initializeData()

  console.timeEnd('purgeConfigTables')
}

function purgeTables(): void {
  console.time('purgeTables')

  const tablesToPurge = [
    'WorkOrderMilestones',
    'WorkOrderComments',
    'WorkOrderBurialSites',
    'WorkOrderContracts',
    'WorkOrders',
    'ContractAttachments',
    'ContractMetadata',
    'ContractTransactions',
    'ContractFees',
    'ContractFields',
    'ContractComments',
    'ContractInterments',
    'ContractServiceTypes',
    'RelatedContracts',
    'Contracts',
    'FuneralHomes',
    'BurialSiteFields',
    'BurialSiteComments',
    'BurialSites'
  ]

  const database = sqlite(databasePath)

  for (const tableName of tablesToPurge) {
    debug(`Purging table: ${tableName}`)

    database.prepare(`delete from ${tableName}`).run()

    database
      .prepare('delete from sqlite_sequence where name = ?')
      .run(tableName)
  }

  database.close()

  console.timeEnd('purgeTables')
}

debug(`Started ${new Date().toLocaleString()}`)

console.time('importFromCsv')

// Purge Tables
purgeTables()
purgeConfigTables()

// Initialize SSM Data
initializeContractTypePrints(user)
initializeFuneralHomes(user)

// Do Imports
const importFromMasterCSV = await import('./import.master.js')
await importFromMasterCSV.default()

const importFromPrepaidCSV = await import('./import.prepaid.js')
await importFromPrepaidCSV.default()

const importFromWorkOrderCSV = await import('./import.workOrder.js')
await importFromWorkOrderCSV.default()

console.timeEnd('importFromCsv')

debug(`Finished ${new Date().toLocaleString()}`)
