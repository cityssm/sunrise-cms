/**
 * Example configuration showing how to enable the database backup task
 *
 * To use this configuration:
 * 1. Add this section to your config.js file
 * 2. Set taskIsEnabled to true
 * 3. Optionally adjust backupHour (default: 2 for 2 AM)
 * 4. Restart the application
 */
export declare const exampleBackupConfig: {
    settings: {
        databaseBackup: {
            taskIsEnabled: boolean;
            backupHour: number;
        };
    };
};
