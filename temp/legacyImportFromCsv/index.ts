// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable no-console */

import sqlite from 'better-sqlite3'
import Debug from 'debug'

import { initializeData } from '../../database/initializeDatabase.js'
import { DEBUG_NAMESPACE } from '../../debug.config.js'
import { sunriseDB as databasePath } from '../../helpers/database.helpers.js'

import { initializeFuneralHomes } from './data.funeralHomes.js'
import { importFromMasterCSV } from './import.master.js'
import { importFromPrepaidCSV } from './import.prepaid.js'
import { importFromWorkOrderCSV } from './import.workOrder.js'
import { user } from './utilities.js'

const debug = Debug(`${DEBUG_NAMESPACE}:legacyImportFromCsv`)

function purgeConfigTables(): void {
  console.time('purgeConfigTables')

  const configTablesToPurge = [
    'CemeteryDirectionsOfArrival',
    'Cemeteries',
    'BurialSiteStatuses',
    'CommittalTypes',
    'ContractTypeFields',
    'ContractTypePrints',
    'ContractTypes',
    'IntermentContainerTypes',
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
    'RelatedContracts',
    'Contracts',
    'FuneralHomes',
    'BurialSiteFields',
    'BurialSiteComments',
    'BurialSites'
  ]

  const database = sqlite(databasePath)

  for (const tableName of tablesToPurge) {
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
initializeFuneralHomes(user)

// Do Imports
await importFromMasterCSV()
await importFromPrepaidCSV()
await importFromWorkOrderCSV()

console.timeEnd('importFromCsv')

debug(`Finished ${new Date().toLocaleString()}`)
