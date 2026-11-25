import type { DatabaseSync } from 'node:sqlite'
import { debuglog } from 'node:util'

import { DEBUG_NAMESPACE } from '../../debug.config.js'
import { sunriseDB } from '../../helpers/database.helpers.js'

import { hasTableColumn } from './helpers.js'

const debug = debuglog(`${DEBUG_NAMESPACE}:database:upgradeToVersion2`)

export default function upgradeToVersion2(database: DatabaseSync): 2 {
  const newVersion = 2
  const rightNowMillis = Date.now()

  database.exec(/* sql */ `
    CREATE TABLE IF NOT EXISTS PaymentTypes (
      paymentTypeId INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      paymentType VARCHAR(100) NOT NULL,
      orderNumber smallint NOT NULL DEFAULT 0,
      recordCreate_username VARCHAR(30) NOT NULL,
      recordCreate_timeMillis INTEGER NOT NULL,
      recordUpdate_username VARCHAR(30) NOT NULL,
      recordUpdate_timeMillis INTEGER NOT NULL,
      recordDelete_username VARCHAR(30),
      recordDelete_timeMillis INTEGER
    )
  `)

  database.exec(/* sql */ `
    CREATE INDEX IF NOT EXISTS idx_PaymentTypes_orderNumber ON PaymentTypes (orderNumber, paymentType)
  `)

  database
    .prepare(/* sql */ `
      INSERT INTO
        PaymentTypes (
          paymentType,
          orderNumber,
          recordCreate_username,
          recordCreate_timeMillis,
          recordUpdate_username,
          recordUpdate_timeMillis
        )
      SELECT
        ?,
        ?,
        'databaseUpgrade',
        ?,
        'databaseUpgrade',
        ?
      WHERE
        NOT EXISTS (
          SELECT
            1
          FROM
            PaymentTypes
          WHERE
            LOWER(paymentType) = LOWER(?)
            AND recordDelete_timeMillis IS NULL
        )
    `)
    .run('Payment Taken', 1, rightNowMillis, rightNowMillis, 'Payment Taken')

  database
    .prepare(/* sql */ `
      INSERT INTO
        PaymentTypes (
          paymentType,
          orderNumber,
          recordCreate_username,
          recordCreate_timeMillis,
          recordUpdate_username,
          recordUpdate_timeMillis
        )
      SELECT
        ?,
        ?,
        'databaseUpgrade',
        ?,
        'databaseUpgrade',
        ?
      WHERE
        NOT EXISTS (
          SELECT
            1
          FROM
            PaymentTypes
          WHERE
            LOWER(paymentType) = LOWER(?)
            AND recordDelete_timeMillis IS NULL
        )
    `)
    .run('Invoiced', 2, rightNowMillis, rightNowMillis, 'Invoiced')

  const paymentTakenTypeId = (
    database
      .prepare(/* sql */ `
        SELECT
          paymentTypeId
        FROM
          PaymentTypes
        WHERE
          LOWER(paymentType) = 'payment taken'
        ORDER BY
          paymentTypeId
        LIMIT
          1
      `)
      .get() as { paymentTypeId: number }
  ).paymentTypeId

  const invoicedTypeId = (
    database
      .prepare(/* sql */ `
        SELECT
          paymentTypeId
        FROM
          PaymentTypes
        WHERE
          LOWER(paymentType) = 'invoiced'
        ORDER BY
          paymentTypeId
        LIMIT
          1
      `)
      .get() as { paymentTypeId: number }
  ).paymentTypeId

  const hasPaymentTypeId = hasTableColumn(
    database,
    'ContractTransactions',
    'paymentTypeId'
  )

  const hasIsInvoiced = hasTableColumn(
    database,
    'ContractTransactions',
    'isInvoiced'
  )

  if (!hasPaymentTypeId) {
    database.exec(
      `ALTER TABLE ContractTransactions ADD COLUMN paymentTypeId INTEGER REFERENCES PaymentTypes (paymentTypeId)`
    )
  }

  if (hasIsInvoiced) {
    database
      .prepare(/* sql */ `
        UPDATE ContractTransactions
        SET
          paymentTypeId = CASE
            WHEN isInvoiced = 1 THEN ?
            ELSE ?
          END
      `)
      .run(invoicedTypeId, paymentTakenTypeId)

    recreateContractTransactionsTable(
      database,
      paymentTakenTypeId,
      invoicedTypeId,
      true
    )
  } else {
    database
      .prepare(/* sql */ `
        UPDATE ContractTransactions
        SET
          paymentTypeId = ?
        WHERE
          paymentTypeId IS NULL
      `)
      .run(paymentTakenTypeId)
  }

  database.exec(`PRAGMA user_version = ${newVersion}`)

  debug(`Updated ${sunriseDB} to database user version ${newVersion}`)

  return newVersion
}

function recreateContractTransactionsTable(
  database: DatabaseSync,
  paymentTakenTypeId: number,
  invoicedTypeId: number,
  hasIsInvoiced: boolean
): void {
  database.exec(/* sql */ `
    CREATE TABLE ContractTransactions_new (
      contractId INTEGER NOT NULL,
      transactionIndex INTEGER NOT NULL,
      transactionDate INTEGER NOT NULL CHECK (transactionDate > 0),
      transactionTime INTEGER NOT NULL CHECK (transactionTime >= 0),
      transactionAmount DECIMAL(8, 2) NOT NULL,
      paymentTypeId INTEGER NOT NULL DEFAULT 1,
      externalReceiptNumber VARCHAR(100),
      transactionNote TEXT,
      recordCreate_username VARCHAR(30) NOT NULL,
      recordCreate_timeMillis INTEGER NOT NULL,
      recordUpdate_username VARCHAR(30) NOT NULL,
      recordUpdate_timeMillis INTEGER NOT NULL,
      recordDelete_username VARCHAR(30),
      recordDelete_timeMillis INTEGER,
      PRIMARY KEY (contractId, transactionIndex),
      FOREIGN KEY (contractId) REFERENCES Contracts (contractId),
      FOREIGN KEY (paymentTypeId) REFERENCES PaymentTypes (paymentTypeId)
    ) WITHOUT rowid
  `)

  if (hasIsInvoiced) {
    database
      .prepare(/* sql */ `
        INSERT INTO
          ContractTransactions_new (
            contractId,
            transactionIndex,
            transactionDate,
            transactionTime,
            transactionAmount,
            paymentTypeId,
            externalReceiptNumber,
            transactionNote,
            recordCreate_username,
            recordCreate_timeMillis,
            recordUpdate_username,
            recordUpdate_timeMillis,
            recordDelete_username,
            recordDelete_timeMillis
          )
        SELECT
          contractId,
          transactionIndex,
          transactionDate,
          transactionTime,
          transactionAmount,
          COALESCE(
            paymentTypeId,
            CASE
              WHEN isInvoiced = 1 THEN ?
              ELSE ?
            END
          ) AS paymentTypeId,
          externalReceiptNumber,
          transactionNote,
          recordCreate_username,
          recordCreate_timeMillis,
          recordUpdate_username,
          recordUpdate_timeMillis,
          recordDelete_username,
          recordDelete_timeMillis
        FROM
          ContractTransactions
      `)
      .run(invoicedTypeId, paymentTakenTypeId)
  } else {
    database.exec(/* sql */ `
      INSERT INTO
        ContractTransactions_new (
          contractId,
          transactionIndex,
          transactionDate,
          transactionTime,
          transactionAmount,
          paymentTypeId,
          externalReceiptNumber,
          transactionNote,
          recordCreate_username,
          recordCreate_timeMillis,
          recordUpdate_username,
          recordUpdate_timeMillis,
          recordDelete_username,
          recordDelete_timeMillis
        )
      SELECT
        contractId,
        transactionIndex,
        transactionDate,
        transactionTime,
        transactionAmount,
        paymentTypeId,
        externalReceiptNumber,
        transactionNote,
        recordCreate_username,
        recordCreate_timeMillis,
        recordUpdate_username,
        recordUpdate_timeMillis,
        recordDelete_username,
        recordDelete_timeMillis
      FROM
        ContractTransactions
    `)
  }

  database.exec('DROP TABLE ContractTransactions')
  database.exec(
    'ALTER TABLE ContractTransactions_new RENAME TO ContractTransactions'
  )

  database.exec(/* sql */ `
    CREATE INDEX IF NOT EXISTS idx_ContractTransactions_orderNumber ON ContractTransactions (contractId, transactionDate, transactionTime)
  `)
}
