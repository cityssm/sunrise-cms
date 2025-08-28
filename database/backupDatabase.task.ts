import { ScheduledTask } from '@cityssm/scheduled-task'
import { daysToMillis, hoursToMillis } from '@cityssm/to-millis'
import Debug from 'debug'
import fs from 'node:fs/promises'
import path from 'node:path'

import { DEBUG_NAMESPACE } from '../debug.config.js'
import { getConfigProperty } from '../helpers/config.helpers.js'
import { backupFolder } from '../helpers/database.helpers.js'

import { backupDatabase } from './backupDatabase.js'

const debug = Debug(`${DEBUG_NAMESPACE}:database:backupDatabase.task`)

const taskName = 'Database Backup Task'

async function cleanupOldBackups(): Promise<void> {
  const deleteAgeDays = getConfigProperty('settings.databaseBackup.deleteAgeDays') as number
  
  if (deleteAgeDays <= 0) {
    debug('Backup cleanup is disabled (deleteAgeDays <= 0)')
    return
  }

  debug(`Starting backup cleanup for files older than ${deleteAgeDays} days...`)
  
  try {
    const files = await fs.readdir(backupFolder)
    const cutoffTime = Date.now() - daysToMillis(deleteAgeDays)
    let deletedCount = 0

    for (const file of files) {
      // Only process backup files (those containing '.db.' pattern)
      if (!file.includes('.db.')) {
        continue
      }

      const filePath = path.join(backupFolder, file)
      
      try {
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        const stats = await fs.stat(filePath)
        
        if (stats.mtime.getTime() < cutoffTime) {
          // eslint-disable-next-line security/detect-non-literal-fs-filename
          await fs.unlink(filePath)
          debug(`Deleted old backup file: ${file}`)
          deletedCount++
        }
      } catch (error) {
        debug(`Error processing backup file ${file}:`, error)
      }
    }

    debug(`Backup cleanup completed. Deleted ${deletedCount} old backup files.`)
  } catch (error) {
    debug('Error during backup cleanup:', error)
  }
}

async function runDatabaseBackup(): Promise<void> {
  debug('Starting database backup...')
  
  const backupPath = await backupDatabase()
  
  if (backupPath) {
    debug(`Database backup completed successfully: ${backupPath}`)
    
    // Clean up old backups after successful backup
    await cleanupOldBackups()
  } else {
    debug('Database backup failed')
  }
}

const backupHour = getConfigProperty('settings.databaseBackup.backupHour') as number

const scheduledTask = new ScheduledTask(taskName, runDatabaseBackup, {
  schedule: {
    hour: backupHour,
    minute: 0,
    second: 0
  },

  minimumIntervalMillis: hoursToMillis(24), // Run once per day
  startTask: true
})

await scheduledTask.runTask()