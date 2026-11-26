import assert from 'node:assert';
import fs from 'node:fs';
import { describe, it } from 'node:test';
import getBurialSiteTypes from '../database/getBurialSiteTypes.js';
import getPaymentTypes from '../database/getPaymentTypes.js';
import { initializeDatabase } from '../database/initialize/initializeDatabase.js';
import { sunriseDatabasePath as databasePath, sunriseDatabasePathTesting, useTestDatabases } from '../helpers/database.helpers.js';
await describe('Initialize Database', async () => {
    await it('initializes the database', () => {
        assert.ok(useTestDatabases, 'Test database must be used!');
        assert.strictEqual(databasePath, sunriseDatabasePathTesting, 'Database path does not match the testing database');
        if (fs.existsSync(databasePath)) {
            try {
                fs.unlinkSync(databasePath);
                assert.ok(!fs.existsSync(databasePath), 'Existing database file was not deleted');
            }
            catch (error) {
                console.log('Error deleting existing database file:', error);
            }
        }
        const isDatabaseInitialized = initializeDatabase();
        assert.ok(isDatabaseInitialized, 'Database initialization failed');
        assert.notStrictEqual(getBurialSiteTypes().length, 0, 'No burial site types found');
        assert.notStrictEqual(getPaymentTypes().length, 0, 'No payment types found');
    });
});
