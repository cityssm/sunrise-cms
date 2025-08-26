import { describe, it } from 'node:test';
import assert from 'node:assert';
import sqlite from 'better-sqlite3';
import getFuneralDirectorsByFuneralHomeId from '../database/getFuneralDirectorsByFuneralHomeId.js';
describe('Funeral Director Suggestions', () => {
    it('should return funeral directors by funeral home ID', () => {
        // Create an in-memory test database
        const db = sqlite(':memory:');
        // Create the Contracts table
        db.exec(`
      CREATE TABLE Contracts (
        contractId INTEGER PRIMARY KEY,
        funeralHomeId INTEGER,
        funeralDirectorName TEXT,
        recordDelete_timeMillis INTEGER
      )
    `);
        // Insert test data
        const insertContract = db.prepare(`
      INSERT INTO Contracts (contractId, funeralHomeId, funeralDirectorName, recordDelete_timeMillis)
      VALUES (?, ?, ?, ?)
    `);
        // Test data: Different combinations of funeral homes and directors
        insertContract.run(1, 1, 'John Smith', null); // Active contract
        insertContract.run(2, 1, 'Jane Doe', null); // Active contract
        insertContract.run(3, 1, 'John Smith', null); // Duplicate for count test
        insertContract.run(4, 2, 'Bob Johnson', null); // Different funeral home
        insertContract.run(5, 1, '', null); // Empty name (should be filtered)
        insertContract.run(6, 1, null, null); // Null name (should be filtered)
        insertContract.run(7, 1, 'Alice Brown', 123456); // Deleted record (should be filtered)
        insertContract.run(8, 1, '   ', null); // Whitespace only (should be filtered)
        // Test the function
        const results = getFuneralDirectorsByFuneralHomeId(1, db);
        // Should return only valid, non-deleted funeral directors for funeral home 1
        assert.strictEqual(results.length, 2, 'Should return 2 unique funeral directors');
        // John Smith should be first (appears twice, higher usage count)
        assert.strictEqual(results[0].funeralDirectorName, 'John Smith');
        assert.strictEqual(results[0].usageCount, 2);
        // Jane Doe should be second (appears once)
        assert.strictEqual(results[1].funeralDirectorName, 'Jane Doe');
        assert.strictEqual(results[1].usageCount, 1);
        // Test with different funeral home
        const results2 = getFuneralDirectorsByFuneralHomeId(2, db);
        assert.strictEqual(results2.length, 1, 'Should return 1 funeral director for funeral home 2');
        assert.strictEqual(results2[0].funeralDirectorName, 'Bob Johnson');
        // Test with non-existent funeral home
        const results3 = getFuneralDirectorsByFuneralHomeId(999, db);
        assert.strictEqual(results3.length, 0, 'Should return empty array for non-existent funeral home');
        db.close();
    });
});
