import { ScheduledTask } from '@cityssm/scheduled-task';
import { hoursToMillis } from '@cityssm/to-millis';
import Debug from 'debug';
import { DEBUG_NAMESPACE } from '../debug.config.js';
import { getConfigProperty } from '../helpers/config.helpers.js';
import { backupDatabase } from './backupDatabase.js';
const debug = Debug(`${DEBUG_NAMESPACE}:database:backupDatabase.task`);
const taskName = 'Database Backup Task';
async function runDatabaseBackup() {
    debug('Starting database backup...');
    const backupPath = await backupDatabase();
    if (backupPath) {
        debug(`Database backup completed successfully: ${backupPath}`);
    }
    else {
        debug('Database backup failed');
    }
}
const intervalHours = getConfigProperty('settings.databaseBackup.intervalHours');
const scheduledTask = new ScheduledTask(taskName, runDatabaseBackup, {
    schedule: {
        hour: 2, // Run at 2 AM by default
        minute: 0,
        second: 0
    },
    minimumIntervalMillis: hoursToMillis(intervalHours),
    startTask: true
});
await scheduledTask.runTask();
