import { strictEqual } from 'node:assert'
import { describe, it } from 'node:test'

import { getConfigProperty } from '../helpers/config.helpers.js'

describe('database-backup-config', () => {
  it('Can read database backup configuration settings', () => {
    const taskEnabled = getConfigProperty('settings.databaseBackup.taskIsEnabled')
    const backupHour = getConfigProperty('settings.databaseBackup.backupHour')
    const deleteAgeDays = getConfigProperty('settings.databaseBackup.deleteAgeDays')
    
    strictEqual(typeof taskEnabled, 'boolean')
    strictEqual(typeof backupHour, 'number')
    strictEqual(typeof deleteAgeDays, 'number')
    strictEqual(backupHour, 2) // Default value (2 AM)
    strictEqual(deleteAgeDays, 0) // Default value (disabled)
  })
  
  it('Database backup task is disabled by default', () => {
    const taskEnabled = getConfigProperty('settings.databaseBackup.taskIsEnabled')
    strictEqual(taskEnabled, false)
  })

  it('Database backup cleanup is disabled by default', () => {
    const deleteAgeDays = getConfigProperty('settings.databaseBackup.deleteAgeDays')
    strictEqual(deleteAgeDays, 0)
  })
})