import assert from 'node:assert'
import fs from 'node:fs/promises'
import { describe, it } from 'node:test'

import getBurialSiteTypes from '../database/getBurialSiteTypes.js'
import { initializeDatabase } from '../database/initializeDatabase.js'
import {
  sunriseDB as databasePath,
  sunriseDBTesting,
  useTestDatabases
} from '../helpers/database.helpers.js'

await describe('Initialize Database', async () => {
  await it('initializes the database', async () => {
    if (!useTestDatabases) {
      assert.fail('Test database must be used!')
    }

    assert.strictEqual(
      databasePath,
      sunriseDBTesting,
      'Database path does not match the testing database'
    )

    try {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      await fs.unlink(databasePath)
      assert.ok(true, 'Deleted existing database file')
    } catch (error) {
      console.log('Error deleting existing database file:', error)
    }

    const success = initializeDatabase()

    assert.ok(success, 'Database initialization failed')

    assert.ok(getBurialSiteTypes().length > 0, 'No burial site types found')
  })
})
