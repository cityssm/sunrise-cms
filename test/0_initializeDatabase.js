/* eslint-disable unicorn/filename-case, @eslint-community/eslint-comments/disable-enable-pair */
import assert from 'node:assert';
import fs from 'node:fs/promises';
import { initializeDatabase } from '../database/initializeDatabase.js';
import { sunriseDB as databasePath, useTestDatabases } from '../helpers/database.helpers.js';
describe('Initialize Database', () => {
    it('initializes the database', async () => {
        if (!useTestDatabases) {
            assert.fail('Test database must be used!');
        }
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        await fs.unlink(databasePath);
        const success = await initializeDatabase();
        assert.ok(success);
    });
});
