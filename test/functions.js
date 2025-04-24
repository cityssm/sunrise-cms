import assert from 'node:assert';
import fs from 'node:fs';
import { before, describe, it } from 'node:test';
import * as cacheFunctions from '../helpers/functions.cache.js';
import * as sqlFilterFunctions from '../helpers/functions.sqlFilters.js';
import * as userFunctions from '../helpers/functions.user.js';
await describe('functions.cache', async () => {
    const badId = -3;
    // eslint-disable-next-line no-secrets/no-secrets
    const badName = 'qwertyuiopasdfghjklzxcvbnm';
    before(() => {
        cacheFunctions.clearCaches();
    });
    await describe('Burial Site Statuses', async () => {
        await it('returns Burial Site Statuses', async () => {
            cacheFunctions.clearCacheByTableName('BurialSiteStatuses');
            const burialSiteStatuses = await cacheFunctions.getBurialSiteStatuses();
            assert.ok(burialSiteStatuses.length > 0);
            for (const burialSiteStatus of burialSiteStatuses) {
                const byId = await cacheFunctions.getBurialSiteStatusById(burialSiteStatus.burialSiteStatusId);
                assert.strictEqual(burialSiteStatus.burialSiteStatusId, byId?.burialSiteStatusId);
                const byName = await cacheFunctions.getBurialSiteStatusByBurialSiteStatus(burialSiteStatus.burialSiteStatus);
                assert.strictEqual(burialSiteStatus.burialSiteStatus, byName?.burialSiteStatus);
            }
        });
        await it('returns undefined with a bad burialSiteStatusId', async () => {
            const byBadId = await cacheFunctions.getBurialSiteStatusById(badId);
            assert.ok(byBadId === undefined);
        });
        await it('returns undefined with a bad lotStatus', async () => {
            const byBadName = await cacheFunctions.getBurialSiteStatusByBurialSiteStatus(badName);
            assert.ok(byBadName === undefined);
        });
    });
    await describe('Burial Site Types', async () => {
        await it('returns Burial Site Types', async () => {
            cacheFunctions.clearCacheByTableName('BurialSiteTypes');
            const burialSiteTypes = await cacheFunctions.getBurialSiteTypes();
            assert.ok(burialSiteTypes.length > 0);
            for (const burialSiteType of burialSiteTypes) {
                const byId = await cacheFunctions.getBurialSiteTypeById(burialSiteType.burialSiteTypeId);
                assert.strictEqual(burialSiteType.burialSiteTypeId, byId?.burialSiteTypeId);
                const byName = await cacheFunctions.getBurialSiteTypesByBurialSiteType(burialSiteType.burialSiteType);
                assert.strictEqual(burialSiteType.burialSiteType, byName?.burialSiteType);
            }
        });
        await it('returns undefined with a bad burialSiteTypeId', async () => {
            const byBadId = await cacheFunctions.getBurialSiteTypeById(badId);
            assert.ok(byBadId === undefined);
        });
        await it('returns undefined with a bad lotType', async () => {
            const byBadName = await cacheFunctions.getBurialSiteTypesByBurialSiteType(badName);
            assert.ok(byBadName === undefined);
        });
    });
    await describe('Contract Types', async () => {
        await it('returns Contract Types', async () => {
            cacheFunctions.clearCacheByTableName('ContractTypes');
            const contractTypes = await cacheFunctions.getContractTypes();
            assert.ok(contractTypes.length > 0);
            for (const contractType of contractTypes) {
                const byId = await cacheFunctions.getContractTypeById(contractType.contractTypeId);
                assert.strictEqual(contractType.contractTypeId, byId?.contractTypeId);
                const byName = await cacheFunctions.getContractTypeByContractType(contractType.contractType);
                assert.strictEqual(contractType.contractType, byName?.contractType);
            }
        });
        await it('returns undefined with a bad contractTypeId', async () => {
            const byBadId = await cacheFunctions.getContractTypeById(badId);
            assert.ok(byBadId === undefined);
        });
        await it('returns undefined with a bad contractType', async () => {
            const byBadName = await cacheFunctions.getContractTypeByContractType(badName);
            assert.ok(byBadName === undefined);
        });
    });
    await describe('Work Order Types', async () => {
        await it('returns Work Order Types', async () => {
            cacheFunctions.clearCacheByTableName('WorkOrderTypes');
            const workOrderTypes = await cacheFunctions.getWorkOrderTypes();
            assert.ok(workOrderTypes.length > 0);
            for (const workOrderType of workOrderTypes) {
                const byId = await cacheFunctions.getWorkOrderTypeById(workOrderType.workOrderTypeId);
                assert.strictEqual(workOrderType.workOrderTypeId, byId?.workOrderTypeId);
            }
        });
        await it('returns undefined with a bad workOrderTypeId', async () => {
            const byBadId = await cacheFunctions.getWorkOrderTypeById(badId);
            assert.ok(byBadId === undefined);
        });
    });
    await describe('Work Order Milestone Types', async () => {
        await it('returns Work Order Milestone Types', async () => {
            cacheFunctions.clearCacheByTableName('WorkOrderMilestoneTypes');
            const workOrderMilestoneTypes = await cacheFunctions.getWorkOrderMilestoneTypes();
            assert.ok(workOrderMilestoneTypes.length > 0);
            for (const workOrderMilestoneType of workOrderMilestoneTypes) {
                const byId = await cacheFunctions.getWorkOrderMilestoneTypeById(workOrderMilestoneType.workOrderMilestoneTypeId);
                assert.strictEqual(workOrderMilestoneType.workOrderMilestoneTypeId, byId?.workOrderMilestoneTypeId);
                const byName = await cacheFunctions.getWorkOrderMilestoneTypeByWorkOrderMilestoneType(workOrderMilestoneType.workOrderMilestoneType);
                assert.strictEqual(workOrderMilestoneType.workOrderMilestoneType, byName?.workOrderMilestoneType);
            }
        });
        await it('returns undefined with a bad workOrderMilestoneTypeId', async () => {
            const byBadId = await cacheFunctions.getWorkOrderMilestoneTypeById(badId);
            assert.ok(byBadId === undefined);
        });
        await it('returns undefined with a bad workOrderMilestoneType', async () => {
            const byBadName = await cacheFunctions.getWorkOrderMilestoneTypeByWorkOrderMilestoneType(badName);
            assert.ok(byBadName === undefined);
        });
    });
});
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
            assert.notStrictEqual(futureFilter, '');
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
await describe('functions.user', async () => {
    await describe('unauthenticated, no user in session', async () => {
        const noUserRequest = {
            session: {}
        };
        await it('can not update', () => {
            assert.strictEqual(userFunctions.userCanUpdate(noUserRequest), false);
        });
        await it('is not admin', () => {
            assert.strictEqual(userFunctions.userIsAdmin(noUserRequest), false);
        });
    });
    await describe('read only user, no update, no admin', async () => {
        const readOnlyRequest = {
            session: {
                user: {
                    userName: '*test',
                    userProperties: {
                        canUpdate: false,
                        canUpdateWorkOrders: false,
                        isAdmin: false,
                        apiKey: ''
                    }
                }
            }
        };
        await it('can not update', () => {
            assert.strictEqual(userFunctions.userCanUpdate(readOnlyRequest), false);
        });
        await it('is not admin', () => {
            assert.strictEqual(userFunctions.userIsAdmin(readOnlyRequest), false);
        });
    });
    await describe('update only user, no admin', async () => {
        const updateOnlyRequest = {
            session: {
                user: {
                    userName: '*test',
                    userProperties: {
                        canUpdate: true,
                        canUpdateWorkOrders: true,
                        isAdmin: false,
                        apiKey: ''
                    }
                }
            }
        };
        await it('can update', () => {
            assert.strictEqual(userFunctions.userCanUpdate(updateOnlyRequest), true);
        });
        await it('is not admin', () => {
            assert.strictEqual(userFunctions.userIsAdmin(updateOnlyRequest), false);
        });
    });
    await describe('admin only user, no update', async () => {
        const adminOnlyRequest = {
            session: {
                user: {
                    userName: '*test',
                    userProperties: {
                        canUpdate: false,
                        canUpdateWorkOrders: false,
                        isAdmin: true,
                        apiKey: ''
                    }
                }
            }
        };
        await it('can not update', () => {
            assert.strictEqual(userFunctions.userCanUpdate(adminOnlyRequest), false);
        });
        await it('is admin', () => {
            assert.strictEqual(userFunctions.userIsAdmin(adminOnlyRequest), true);
        });
    });
    await describe('update admin user', async () => {
        const updateAdminRequest = {
            session: {
                user: {
                    userName: '*test',
                    userProperties: {
                        canUpdate: true,
                        canUpdateWorkOrders: true,
                        isAdmin: true,
                        apiKey: ''
                    }
                }
            }
        };
        await it('can update', () => {
            assert.strictEqual(userFunctions.userCanUpdate(updateAdminRequest), true);
        });
        await it('is admin', () => {
            assert.strictEqual(userFunctions.userIsAdmin(updateAdminRequest), true);
        });
    });
    await describe('API key check', async () => {
        await it('authenticates with a valid API key', async () => {
            const apiKeysJSON = JSON.parse(fs.readFileSync('data/apiKeys.json', 'utf8'));
            const apiKey = Object.values(apiKeysJSON)[0];
            const apiRequest = {
                params: {
                    apiKey
                }
            };
            assert.strictEqual(await userFunctions.apiKeyIsValid(apiRequest), true);
        });
        await it('fails to authenticate with an invalid API key', async () => {
            const apiRequest = {
                params: {
                    apiKey: 'badKey'
                }
            };
            assert.strictEqual(await userFunctions.apiKeyIsValid(apiRequest), false);
        });
        await it('fails to authenticate with no API key', async () => {
            const apiRequest = {
                params: {}
            };
            assert.strictEqual(await userFunctions.apiKeyIsValid(apiRequest), false);
        });
    });
});
