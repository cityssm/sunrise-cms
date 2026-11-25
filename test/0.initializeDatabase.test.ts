import assert from 'node:assert'
import fs from 'node:fs'
import { describe, it } from 'node:test'

import getBurialSiteTypes from '../database/getBurialSiteTypes.js'
import { initializeDatabase } from '../database/initialize/initializeDatabase.js'
import { currentUserVersion } from '../database/initialize/helpers.js'
import {
  sunriseDB as databasePath,
  sunriseDBTesting,
  getDatabaseConnection,
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

    const database = getDatabaseConnection()
    const versionRow = database
      .prepare('PRAGMA user_version')
      .get() as { user_version: number }

    assert.strictEqual(versionRow.user_version, currentUserVersion)

    const indexRow = database
      .prepare(
        "SELECT 1 FROM sqlite_master WHERE type = 'index' AND name = 'idx_Contracts_burialSiteId'"
      )
      .get()

    assert.ok(indexRow, 'Contract burial site index was not created')
    database.close()
  })
})
