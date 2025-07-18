import { before, describe, it } from 'node:test';
import * as cacheFunctions from '../helpers/cache.helpers.js';
await describe('helpers.cache', async () => {
    const badId = -3;
    // eslint-disable-next-line no-secrets/no-secrets, @cspell/spellchecker
    const badName = 'qwertyuiopasdfghjklzxcvbnm';
    before(() => {
        cacheFunctions.clearCaches();
    });
    await describe('Burial Site Statuses', async () => {
        await it('returns Burial Site Statuses', () => {
            cacheFunctions.clearCacheByTableName('BurialSiteStatuses');
            const burialSiteStatuses = cacheFunctions.getBurialSiteStatuses();
            assert.ok(burialSiteStatuses.length > 0);
            for (const burialSiteStatus of burialSiteStatuses) {
                const byId = cacheFunctions.getBurialSiteStatusById(burialSiteStatus.burialSiteStatusId);
                assert.strictEqual(burialSiteStatus.burialSiteStatusId, byId?.burialSiteStatusId);
                const byName = cacheFunctions.getBurialSiteStatusByBurialSiteStatus(burialSiteStatus.burialSiteStatus);
                assert.strictEqual(burialSiteStatus.burialSiteStatus, byName?.burialSiteStatus);
            }
        });
        await it('returns undefined with a bad burialSiteStatusId', () => {
            const byBadId = cacheFunctions.getBurialSiteStatusById(badId);
            assert.ok(byBadId === undefined);
        });
        await it('returns undefined with a bad lotStatus', () => {
            const byBadName = cacheFunctions.getBurialSiteStatusByBurialSiteStatus(badName);
            assert.ok(byBadName === undefined);
        });
    });
    await describe('Burial Site Types', async () => {
        await it('returns Burial Site Types', () => {
            cacheFunctions.clearCacheByTableName('BurialSiteTypes');
            const burialSiteTypes = cacheFunctions.getBurialSiteTypes();
            assert.ok(burialSiteTypes.length > 0);
            for (const burialSiteType of burialSiteTypes) {
                const byId = cacheFunctions.getBurialSiteTypeById(burialSiteType.burialSiteTypeId);
                assert.strictEqual(burialSiteType.burialSiteTypeId, byId?.burialSiteTypeId);
                const byName = cacheFunctions.getBurialSiteTypesByBurialSiteType(burialSiteType.burialSiteType);
                assert.strictEqual(burialSiteType.burialSiteType, byName?.burialSiteType);
            }
        });
        await it('returns undefined with a bad burialSiteTypeId', () => {
            const byBadId = cacheFunctions.getBurialSiteTypeById(badId);
            assert.ok(byBadId === undefined);
        });
        await it('returns undefined with a bad lotType', () => {
            const byBadName = cacheFunctions.getBurialSiteTypesByBurialSiteType(badName);
            assert.ok(byBadName === undefined);
        });
    });
    await describe('Contract Types', async () => {
        await it('returns Contract Types', () => {
            cacheFunctions.clearCacheByTableName('ContractTypes');
            const contractTypes = cacheFunctions.getContractTypes();
            assert.ok(contractTypes.length > 0);
            for (const contractType of contractTypes) {
                const byId = cacheFunctions.getContractTypeById(contractType.contractTypeId);
                assert.strictEqual(contractType.contractTypeId, byId?.contractTypeId);
                const byName = cacheFunctions.getContractTypeByContractType(contractType.contractType);
                assert.strictEqual(contractType.contractType, byName?.contractType);
            }
        });
        await it('returns undefined with a bad contractTypeId', () => {
            const byBadId = cacheFunctions.getContractTypeById(badId);
            assert.ok(byBadId === undefined);
        });
        await it('returns undefined with a bad contractType', () => {
            const byBadName = cacheFunctions.getContractTypeByContractType(badName);
            assert.ok(byBadName === undefined);
        });
    });
    await describe('Work Order Types', async () => {
        await it('returns Work Order Types', () => {
            cacheFunctions.clearCacheByTableName('WorkOrderTypes');
            const workOrderTypes = cacheFunctions.getWorkOrderTypes();
            assert.ok(workOrderTypes.length > 0);
            for (const workOrderType of workOrderTypes) {
                const byId = cacheFunctions.getWorkOrderTypeById(workOrderType.workOrderTypeId);
                assert.strictEqual(workOrderType.workOrderTypeId, byId?.workOrderTypeId);
            }
        });
        await it('returns undefined with a bad workOrderTypeId', () => {
            const byBadId = cacheFunctions.getWorkOrderTypeById(badId);
            assert.ok(byBadId === undefined);
        });
    });
    await describe('Work Order Milestone Types', async () => {
        await it('returns Work Order Milestone Types', () => {
            cacheFunctions.clearCacheByTableName('WorkOrderMilestoneTypes');
            const workOrderMilestoneTypes = cacheFunctions.getWorkOrderMilestoneTypes();
            assert.ok(workOrderMilestoneTypes.length > 0);
            for (const workOrderMilestoneType of workOrderMilestoneTypes) {
                const byId = cacheFunctions.getWorkOrderMilestoneTypeById(workOrderMilestoneType.workOrderMilestoneTypeId);
                assert.strictEqual(workOrderMilestoneType.workOrderMilestoneTypeId, byId?.workOrderMilestoneTypeId);
                const byName = cacheFunctions.getWorkOrderMilestoneTypeByWorkOrderMilestoneType(workOrderMilestoneType.workOrderMilestoneType);
                assert.strictEqual(workOrderMilestoneType.workOrderMilestoneType, byName?.workOrderMilestoneType);
            }
        });
        await it('returns undefined with a bad workOrderMilestoneTypeId', () => {
            const byBadId = cacheFunctions.getWorkOrderMilestoneTypeById(badId);
            assert.ok(byBadId === undefined);
        });
        await it('returns undefined with a bad workOrderMilestoneType', () => {
            const byBadName = cacheFunctions.getWorkOrderMilestoneTypeByWorkOrderMilestoneType(badName);
            assert.ok(byBadName === undefined);
        });
    });
});
