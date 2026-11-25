import assert from 'node:assert'
import fs from 'node:fs'
import { DatabaseSync } from 'node:sqlite'
import { describe, it } from 'node:test'

import getBurialSiteTypes from '../database/getBurialSiteTypes.js'
import getPaymentTypes from '../database/getPaymentTypes.js'
import { initializeDatabase } from '../database/initialize/initializeDatabase.js'
import { getCurrentUserVersion } from '../database/initialize/helpers.js'
import upgradeDatabase from '../database/initialize/upgradeDatabase.js'
import {
  sunriseDB as databasePath,
  sunriseDBTesting,
  useTestDatabases
} from '../helpers/database.helpers.js'

// eslint-disable-next-line node-test/no-async-describe
await describe('Initialize Database', async () => {
  await it('initializes the database', () => {
    assert.ok(useTestDatabases, 'Test database must be used!')

    assert.strictEqual(
      databasePath,
      sunriseDBTesting,
      'Database path does not match the testing database'
    )

    if (fs.existsSync(databasePath)) {
      try {
        fs.unlinkSync(databasePath)

        // eslint-disable-next-line node-test/no-conditional-assertion
        assert.ok(
          !fs.existsSync(databasePath),
          'Existing database file was not deleted'
        )
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log('Error deleting existing database file:', error)
      }
    }

    const isDatabaseInitialized = initializeDatabase()

    assert.ok(isDatabaseInitialized, 'Database initialization failed')

    assert.notStrictEqual(
      getBurialSiteTypes().length,
      0,
      'No burial site types found'
    )

    assert.notStrictEqual(
      getPaymentTypes().length,
      0,
      'No payment types found'
    )
  })

  await it('upgrades old transaction invoiced values to payment types', () => {
    const database = new DatabaseSync(':memory:')

    database.exec(/* sql */ `
      CREATE TABLE Contracts (
        contractId INTEGER NOT NULL PRIMARY KEY
      )
    `)

    database.exec(/* sql */ `
      CREATE TABLE ContractTransactions (
        contractId INTEGER NOT NULL,
        transactionIndex INTEGER NOT NULL,
        transactionDate INTEGER NOT NULL,
        transactionTime INTEGER NOT NULL,
        transactionAmount DECIMAL(8, 2) NOT NULL,
        isInvoiced bit NOT NULL DEFAULT 0,
        externalReceiptNumber VARCHAR(100),
        transactionNote TEXT,
        recordCreate_username VARCHAR(30) NOT NULL,
        recordCreate_timeMillis INTEGER NOT NULL,
        recordUpdate_username VARCHAR(30) NOT NULL,
        recordUpdate_timeMillis INTEGER NOT NULL,
        recordDelete_username VARCHAR(30),
        recordDelete_timeMillis INTEGER,
        PRIMARY KEY (contractId, transactionIndex)
      ) WITHOUT rowid
    `)

    database.exec('PRAGMA user_version = 1')

    database.exec(/* sql */ `
      INSERT INTO
        Contracts (
          contractId
        )
      VALUES
        (1)
    `)

    database.exec(/* sql */ `
      INSERT INTO
        ContractTransactions (
          contractId,
          transactionIndex,
          transactionDate,
          transactionTime,
          transactionAmount,
          isInvoiced,
          externalReceiptNumber,
          transactionNote,
          recordCreate_username,
          recordCreate_timeMillis,
          recordUpdate_username,
          recordUpdate_timeMillis
        )
      VALUES
        (1, 0, 20240101, 930, 100, 0, '', '', 'test', 1, 'test', 1),
        (1, 1, 20240101, 931, 200, 1, '', '', 'test', 1, 'test', 1)
    `)

    const versionAfterUpgrade = upgradeDatabase(database)

    assert.strictEqual(versionAfterUpgrade, 2)
    assert.strictEqual(getCurrentUserVersion(database), 2)

    const paymentTypes = database
      .prepare(/* sql */ `
        SELECT
          paymentTypeId,
          paymentType
        FROM
          PaymentTypes
        WHERE
          recordDelete_timeMillis IS NULL
      `)
      .all() as Array<{ paymentType: string; paymentTypeId: number }>

    const paymentTakenType = paymentTypes.find(
      (paymentType) => paymentType.paymentType === 'Payment Taken'
    ) as { paymentType: string; paymentTypeId: number }

    const invoicedType = paymentTypes.find(
      (paymentType) => paymentType.paymentType === 'Invoiced'
    ) as { paymentType: string; paymentTypeId: number }

    assert.notStrictEqual(paymentTakenType, undefined)
    assert.notStrictEqual(invoicedType, undefined)

    const migratedTransactions = database
      .prepare(/* sql */ `
        SELECT
          transactionIndex,
          paymentTypeId
        FROM
          ContractTransactions
        ORDER BY
          transactionIndex
      `)
      .all() as Array<{ paymentTypeId: number; transactionIndex: number }>

    assert.strictEqual(migratedTransactions[0].paymentTypeId, paymentTakenType.paymentTypeId)
    assert.strictEqual(migratedTransactions[1].paymentTypeId, invoicedType.paymentTypeId)

    const contractTransactionsColumns = database
      .prepare(/* sql */ `
        SELECT
          name
        FROM
          pragma_table_info('ContractTransactions')
      `)
      .all() as Array<{ name: string }>

    assert.ok(
      contractTransactionsColumns.some((column) => column.name === 'paymentTypeId')
    )
    assert.ok(
      !contractTransactionsColumns.some((column) => column.name === 'isInvoiced')
    )

    database.close()
  })
})
