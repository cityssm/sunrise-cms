import assert from 'node:assert'
import fs from 'node:fs/promises'
import { describe, it } from 'node:test'

import getBurialSiteTypes from '../database/getBurialSiteTypes.js'
import { initializeDatabase } from '../database/initializeDatabase.js'
import {
  sunriseDB as databasePath,
  useTestDatabases
} from '../helpers/database.helpers.js'

await describe('Initialize Database', async () => {
  await it('initializes the database', async () => {
    if (!useTestDatabases) {
      assert.fail('Test database must be used!')
    }

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await fs.unlink(databasePath)

    const success = initializeDatabase()

    assert.ok(success)

    assert.ok(getBurialSiteTypes().length > 0)
  })
})
