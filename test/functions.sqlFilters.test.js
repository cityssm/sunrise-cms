import assert from 'node:assert';
import { describe, it } from 'node:test';
import * as sqlFilterFunctions from '../helpers/functions.sqlFilters.js';
await describe('functions.sqlFilters', async () => {
    await describe('BurialSiteName filter', async () => {
        await it('returns startsWith filter', () => {
            const filter = sqlFilterFunctions.getBurialSiteNameWhereClause('TEST1 TEST2', 'startsWith', 'l');
            assert.strictEqual(filter.sqlWhereClause, " and l.burialSiteName like ? || '%'");
            assert.strictEqual(filter.sqlParameters.length, 1);
            assert.ok(filter.sqlParameters.includes('TEST1 TEST2'));
        });
        await it('returns endsWith filter', () => {
            const filter = sqlFilterFunctions.getBurialSiteNameWhereClause('TEST1 TEST2', 'endsWith', 'l');
            assert.strictEqual(filter.sqlWhereClause, " and l.burialSiteName like '%' || ?");
            assert.strictEqual(filter.sqlParameters.length, 1);
            assert.strictEqual(filter.sqlParameters[0], 'TEST1 TEST2');
        });
        await it('returns contains filter', () => {
            const filter = sqlFilterFunctions.getBurialSiteNameWhereClause('TEST1 TEST2', '', 'l');
            assert.strictEqual(filter.sqlWhereClause, ' and instr(lower(l.burialSiteName), ?) and instr(lower(l.burialSiteName), ?)');
            assert.ok(filter.sqlParameters.includes('test1'));
            assert.ok(filter.sqlParameters.includes('test2'));
        });
        await it('handles empty filter', () => {
            const filter = sqlFilterFunctions.getBurialSiteNameWhereClause('', '');
            assert.strictEqual(filter.sqlWhereClause, '');
            assert.strictEqual(filter.sqlParameters.length, 0);
        });
        await it('handles undefined filter', () => {
            const filter = sqlFilterFunctions.getBurialSiteNameWhereClause(undefined, undefined, 'l');
            assert.strictEqual(filter.sqlWhereClause, '');
            assert.strictEqual(filter.sqlParameters.length, 0);
        });
    });
    await describe('OccupancyTime filter', async () => {
        await it('creates three different filters', () => {
            const currentFilter = sqlFilterFunctions.getContractTimeWhereClause('current');
            assert.notStrictEqual(currentFilter.sqlWhereClause, '');
            const pastFilter = sqlFilterFunctions.getContractTimeWhereClause('past');
            assert.notStrictEqual(pastFilter.sqlWhereClause, '');
            const futureFilter = sqlFilterFunctions.getContractTimeWhereClause('future');
            assert.notStrictEqual(futureFilter.sqlWhereClause, '');
            assert.notStrictEqual(currentFilter.sqlWhereClause, pastFilter.sqlWhereClause);
            assert.notStrictEqual(currentFilter.sqlWhereClause, futureFilter.sqlWhereClause);
            assert.notStrictEqual(pastFilter.sqlWhereClause, futureFilter.sqlWhereClause);
        });
        await it('handles empty filter', () => {
            const filter = sqlFilterFunctions.getContractTimeWhereClause('');
            assert.strictEqual(filter.sqlWhereClause, '');
            assert.strictEqual(filter.sqlParameters.length, 0);
        });
        await it('handles undefined filter', () => {
            const filter = sqlFilterFunctions.getContractTimeWhereClause(undefined, 'o');
            assert.strictEqual(filter.sqlWhereClause, '');
            assert.strictEqual(filter.sqlParameters.length, 0);
        });
    });
    await describe('DeceasedName filter', async () => {
        await it('returns filter', () => {
            const filter = sqlFilterFunctions.getDeceasedNameWhereClause('TEST1 TEST2', 'o');
            assert.strictEqual(filter.sqlWhereClause, ' and instr(lower(o.deceasedName), ?) and instr(lower(o.deceasedName), ?)');
            assert.ok(filter.sqlParameters.length === 2);
            assert.ok(filter.sqlParameters.includes('test1'));
            assert.ok(filter.sqlParameters.includes('test2'));
        });
        await it('handles empty filter', () => {
            const filter = sqlFilterFunctions.getDeceasedNameWhereClause('');
            assert.strictEqual(filter.sqlWhereClause, '');
            assert.strictEqual(filter.sqlParameters.length, 0);
        });
        await it('handles undefined filter', () => {
            const filter = sqlFilterFunctions.getDeceasedNameWhereClause(undefined, 'o');
            assert.strictEqual(filter.sqlWhereClause, '');
            assert.strictEqual(filter.sqlParameters.length, 0);
        });
    });
});
