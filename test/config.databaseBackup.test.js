import { strictEqual } from 'node:assert';
import { describe, it } from 'node:test';
import { getConfigProperty } from '../helpers/config.helpers.js';
describe('database-backup-config', () => {
    it('Can read database backup configuration settings', () => {
        const taskEnabled = getConfigProperty('settings.databaseBackup.taskIsEnabled');
        const intervalHours = getConfigProperty('settings.databaseBackup.intervalHours');
        strictEqual(typeof taskEnabled, 'boolean');
        strictEqual(typeof intervalHours, 'number');
        strictEqual(intervalHours, 24); // Default value
    });
    it('Database backup task is disabled by default', () => {
        const taskEnabled = getConfigProperty('settings.databaseBackup.taskIsEnabled');
        strictEqual(taskEnabled, false);
    });
});
