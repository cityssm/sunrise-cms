import { strictEqual } from 'node:assert'
import { describe, it } from 'node:test'

import { getConfigProperty } from '../helpers/config.helpers.js'

describe('database-backup-config', () => {
  it('Can read database backup configuration settings', () => {
    const taskEnabled = getConfigProperty('settings.databaseBackup.taskIsEnabled')
    const backupHour = getConfigProperty('settings.databaseBackup.backupHour')
    
    strictEqual(typeof taskEnabled, 'boolean')
    strictEqual(typeof backupHour, 'number')
    strictEqual(backupHour, 2) // Default value (2 AM)
  })
  
  it('Database backup task is disabled by default', () => {
    const taskEnabled = getConfigProperty('settings.databaseBackup.taskIsEnabled')
    strictEqual(taskEnabled, false)
  })
})