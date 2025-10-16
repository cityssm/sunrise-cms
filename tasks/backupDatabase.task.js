import fs from 'node:fs/promises';
import path from 'node:path';
import { ScheduledTask } from '@cityssm/scheduled-task';
import { daysToMillis, hoursToMillis, millisecondsInOneDay } from '@cityssm/to-millis';
import camelcase from 'camelcase';
import Debug from 'debug';
import { backupDatabase } from '../database/backupDatabase.js';
import { DEBUG_NAMESPACE } from '../debug.config.js';
import { getConfigProperty } from '../helpers/config.helpers.js';
import { backupFolder, getLastBackupDate } from '../helpers/database.helpers.js';
const taskName = 'Database Backup Task';
const debug = Debug(`${DEBUG_NAMESPACE}:tasks:${camelcase(taskName)}`);
async function cleanupOldBackups() {
    const deleteAgeDays = getConfigProperty('settings.databaseBackup.deleteAgeDays');
    if (deleteAgeDays <= 0) {
        debug('Backup cleanup is disabled (deleteAgeDays <= 0)');
        return;
    }
    const deleteAgeMillis = daysToMillis(deleteAgeDays);
    debug(`Starting backup cleanup for files older than ${deleteAgeDays} days...`);
    try {
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        const files = await fs.readdir(backupFolder);
        const cutoffTime = Date.now() - deleteAgeMillis;
        let deletedCount = 0;
        for (const file of files) {
            // Process backup files (those containing '.db.' pattern)
            if (!file.includes('.db.')) {
                continue;
            }
            const filePath = path.join(backupFolder, file);
            try {
                // eslint-disable-next-line security/detect-non-literal-fs-filename
                const stats = await fs.stat(filePath);
                if (stats.mtime.getTime() < cutoffTime) {
                    // eslint-disable-next-line security/detect-non-literal-fs-filename
                    await fs.unlink(filePath);
                    debug(`Deleted old backup file: ${file}`);
                    deletedCount += 1;
                }
            }
            catch (error) {
                debug(`Error processing backup file ${file}:`, error);
            }
        }
        debug(`Backup cleanup completed. Deleted ${deletedCount} old backup files.`);
    }
    catch (error) {
        debug('Error during backup cleanup:', error);
    }
}
async function runDatabaseBackup() {
    debug('Starting database backup...');
    const backupPath = await backupDatabase();
    if (backupPath === false) {
        debug('Database backup failed');
    }
    else {
        debug(`Database backup completed successfully: ${backupPath}`);
        // Clean up old backups after successful backup
        await cleanupOldBackups();
    }
}
const backupHour = getConfigProperty('settings.databaseBackup.backupHour');
const lastBackupDate = await getLastBackupDate();
const scheduledTask = new ScheduledTask(taskName, runDatabaseBackup, {
    schedule: {
        hour: backupHour,
        minute: 0,
        second: 0
    },
    lastRunMillis: lastBackupDate?.getTime(),
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    minimumIntervalMillis: hoursToMillis(6),
    startTask: true
});
if (Date.now() - (lastBackupDate?.getTime() ?? 0) > millisecondsInOneDay) {
    await scheduledTask.runTask();
}
