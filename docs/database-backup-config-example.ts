/**
 * Example configuration showing how to enable the database backup task
 * 
 * To use this configuration:
 * 1. Add this section to your config.js file
 * 2. Set taskIsEnabled to true 
 * 3. Optionally adjust intervalHours (default: 24)
 * 4. Restart the application
 */

export const exampleBackupConfig = {
  settings: {
    databaseBackup: {
      // Enable the background database backup task
      taskIsEnabled: true,
      
      // Run backups every 12 hours instead of the default 24
      intervalHours: 12
    }
  }
}

/*
Example output when enabled:
sunrise:database:backupDatabase.task Starting database backup... +0ms
sunrise:database:backupDatabase Database backup completed successfully: data/backups/sunrise.db.1756207892035 +5ms
sunrise:database:backupDatabase.task Database backup completed successfully: data/backups/sunrise.db.1756207892035 +0ms
*/