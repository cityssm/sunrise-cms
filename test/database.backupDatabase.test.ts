import { strictEqual } from 'node:assert'
import { describe, it } from 'node:test'

import { backupDatabase } from '../database/backupDatabase.js'

describe('database-backupDatabase', () => {
  it('Exports the backupDatabase function', () => {
    strictEqual(typeof backupDatabase, 'function')
  })

  it('Returns a result when called', async () => {
    const result = await backupDatabase()
    // Result should be either a string (backup path) or false
    strictEqual(typeof result === 'string' || result === false, true)
  })
})