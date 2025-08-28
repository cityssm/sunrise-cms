/**
 * Example configuration showing how to enable the database backup task
 *
 * To use this configuration:
 * 1. Add this section to your config.js file
 * 2. Set taskIsEnabled to true
 * 3. Optionally adjust backupHour (default: 2 for 2 AM)
 * 4. Restart the application
 */
export const exampleBackupConfig = {
    settings: {
        databaseBackup: {
            // Enable the background database backup task
            taskIsEnabled: true,
            // Run backups at 3 AM instead of the default 2 AM
            backupHour: 3
        }
    }
};
/*
Example output when enabled:
sunrise:database:backupDatabase.task Starting database backup... +0ms
sunrise:database:backupDatabase Database backup completed successfully: data/backups/sunrise.db.1756207892035 +5ms
sunrise:database:backupDatabase.task Database backup completed successfully: data/backups/sunrise.db.1756207892035 +0ms
*/ 
