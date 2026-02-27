import assert from 'node:assert';
import { after, before, describe, it } from 'node:test';
import sqlite from 'better-sqlite3';
import addCemetery from '../database/addCemetery.js';
import addBurialSite from '../database/addBurialSite.js';
import addContract from '../database/addContract.js';
import addContractComment from '../database/addContractComment.js';
import addContractInterment from '../database/addContractInterment.js';
import addContractServiceType from '../database/addContractServiceType.js';
import addContractTransaction from '../database/addContractTransaction.js';
import { deleteContract } from '../database/deleteContract.js';
import deleteContractInterment from '../database/deleteContractInterment.js';
import deleteContractServiceType from '../database/deleteContractServiceType.js';
import deleteContractTransaction from '../database/deleteContractTransaction.js';
import getContract from '../database/getContract.js';
import getContractAttachment from '../database/getContractAttachment.js';
import getContractAttachments from '../database/getContractAttachments.js';
import getContractComments from '../database/getContractComments.js';
import getContractFees from '../database/getContractFees.js';
import getContractFields from '../database/getContractFields.js';
import getContractInterments from '../database/getContractInterments.js';
import getContractMetadataByContractId from '../database/getContractMetadataByContractId.js';
import getContracts from '../database/getContracts.js';
import getContractTransactions from '../database/getContractTransactions.js';
import getNextContractId from '../database/getNextContractId.js';
import getPreviousContractId from '../database/getPreviousContractId.js';
import updateContract from '../database/updateContract.js';
import updateContractComment from '../database/updateContractComment.js';
import updateContractInterment from '../database/updateContractInterment.js';
import updateContractTransaction from '../database/updateContractTransaction.js';
import { sunriseDB } from '../helpers/database.helpers.js';
const testUser = {
    userName: 'testUser',
    userProperties: {
        canUpdateCemeteries: true,
        canUpdateContracts: true,
        canUpdateWorkOrders: true,
        isAdmin: false
    },
    userSettings: {}
};
await describe('database/contracts', async () => {
    const database = sqlite(sunriseDB, { readonly: true });
    after(() => {
        database.close();
    });
    await it('can execute getContract()', async () => {
        await getContract(1, database);
        assert.ok(true, 'getContract() executed without error');
    });
    await it('can execute getContractAttachment()', () => {
        getContractAttachment(1, database);
        assert.ok(true, 'getContractAttachment() executed without error');
    });
    await it('can execute getContractAttachments()', () => {
        getContractAttachments(1, database);
        assert.ok(true, 'getContractAttachments() executed without error');
    });
    await it('can execute getContractComments()', () => {
        getContractComments(1, database);
        assert.ok(true, 'getContractComments() executed without error');
    });
    await it('can execute getContractFees()', () => {
        getContractFees(1, database);
        assert.ok(true, 'getContractFees() executed without error');
    });
    await it('can execute getContractFields()', () => {
        getContractFields(1, database);
        assert.ok(true, 'getContractFields() executed without error');
    });
    await it('can execute getContractInterments()', () => {
        getContractInterments(1, database);
        assert.ok(true, 'getContractInterments() executed without error');
    });
    await it('can execute getContractMetadataByContractId()', () => {
        getContractMetadataByContractId(1, '', database);
        assert.ok(true, 'getContractMetadataByContractId() executed without error');
    });
    await it('can execute getContractTransactions()', async () => {
        await getContractTransactions(1, { includeIntegrations: true }, database);
        assert.ok(true, 'getContractTransactions() executed without error');
    });
    await describe('can execute getContracts()', async () => {
        const options = {
            limit: 10,
            offset: 0,
            includeFees: true,
            includeInterments: true,
            includeTransactions: true
        };
        await it('executes without filters', async () => {
            await getContracts({}, options, database);
            assert.ok(true, 'getContracts() executed without filters');
        });
        await it('executes with burialSiteId filter', async () => {
            await getContracts({ burialSiteId: '1' }, options, database);
            assert.ok(true, 'getContracts() executed with burialSiteId filter');
        });
        await it('executes with contractEffectiveDateString filter', async () => {
            await getContracts({ contractEffectiveDateString: '2023-01-01' }, options, database);
            assert.ok(true, 'getContracts() executed with contractEffectiveDateString filter');
        });
        await it('executes with contractStartDateString filter', async () => {
            await getContracts({ contractStartDateString: '2023-01-01' }, options, database);
            assert.ok(true, 'getContracts() executed with contractStartDateString filter');
        });
        await it('executes with contractTime filter', async () => {
            await getContracts({ contractTime: 'current' }, options, database);
            assert.ok(true, 'getContracts() executed with contractTime filter');
        });
        await it('executes with cemeteryId filter', async () => {
            await getContracts({ cemeteryId: '1' }, options, database);
            assert.ok(true, 'getContracts() executed with cemeteryId filter');
        });
        await it('executes with contractTypeId filter', async () => {
            await getContracts({ contractTypeId: '1' }, options, database);
            assert.ok(true, 'getContracts() executed with contractTypeId filter');
        });
        await it('executes with deceasedName filter', async () => {
            await getContracts({ deceasedName: 'John Doe' }, options, database);
            assert.ok(true, 'getContracts() executed with deceasedName filter');
        });
        await it('executes with purchaserName filter', async () => {
            await getContracts({ purchaserName: 'Jane Doe' }, options, database);
            assert.ok(true, 'getContracts() executed with purchaserName filter');
        });
        await it('executes with burialSiteName filter', async () => {
            await getContracts({ burialSiteName: 'CEM' }, options, database);
            assert.ok(true, 'getContracts() executed with burialSiteName filter');
        });
        await it('executes with burialSiteTypeId filter', async () => {
            await getContracts({ burialSiteTypeId: '1' }, options, database);
            assert.ok(true, 'getContracts() executed with burialSiteTypeId filter');
        });
        await it('executes with funeralHomeId filter', async () => {
            await getContracts({ funeralHomeId: '1' }, options, database);
            assert.ok(true, 'getContracts() executed with funeralHomeId filter');
        });
        await it('executes with funeralTime filter', async () => {
            await getContracts({ funeralTime: 'upcoming' }, options, database);
            assert.ok(true, 'getContracts() executed with funeralTime filter');
        });
        await it('executes with workOrderId filter', async () => {
            await getContracts({ workOrderId: '1' }, options, database);
            assert.ok(true, 'getContracts() executed with workOrderId filter');
        });
        await it('executes with notWorkOrderId filter', async () => {
            await getContracts({ notWorkOrderId: '1' }, options, database);
            assert.ok(true, 'getContracts() executed with notWorkOrderId filter');
        });
        await it('executes with notContractId filter', async () => {
            await getContracts({ notContractId: '1' }, options, database);
            assert.ok(true, 'getContracts() executed with notContractId filter');
        });
        await it('executes with relatedContractId filter', async () => {
            await getContracts({ relatedContractId: '1' }, options, database);
            assert.ok(true, 'getContracts() executed with relatedContractId filter');
        });
        await it('executes with notRelatedContractId filter', async () => {
            await getContracts({ notRelatedContractId: '1' }, options, database);
            assert.ok(true, 'getContracts() executed with notRelatedContractId filter');
        });
    });
    await it('can execute getPreviousContractId()', () => {
        getPreviousContractId(1, database);
        assert.ok(true, 'getPreviousContractId() executed without error');
    });
    await it('can execute getNextContractId()', () => {
        getNextContractId(1, database);
        assert.ok(true, 'getNextContractId() executed without error');
    });
    await describe('Contract Workflow', async () => {
        let cemeteryId;
        let burialSiteId;
        let contractId;
        let contractCommentId;
        let transactionIndex;
        let intermentNumber;
        before(async () => {
            // Create a cemetery and burial site for the contract
            cemeteryId = addCemetery({
                cemeteryName: 'Test Cemetery',
                cemeteryKey: 'TESTCEM',
                cemeteryDescription: '',
                parentCemeteryId: '',
                cemeteryLatitude: '',
                cemeteryLongitude: '',
                cemeterySvg: '',
                cemeteryAddress1: '',
                cemeteryAddress2: '',
                cemeteryCity: '',
                cemeteryPostalCode: '',
                cemeteryProvince: '',
                cemeteryPhoneNumber: ''
            }, testUser);
            const burialSiteResult = addBurialSite({
                cemeteryId,
                burialSiteTypeId: 1,
                burialSiteStatusId: 1,
                burialSiteNameSegment1: 'A',
                burialSiteNameSegment2: '1'
            }, testUser);
            burialSiteId = burialSiteResult.burialSiteId;
        });
        await it('creates a contract', () => {
            contractId = addContract({
                contractTypeId: 1,
                burialSiteId,
                contractStartDateString: '2024-01-01',
                contractEndDateString: '',
                purchaserName: 'Test Purchaser'
            }, testUser);
            assert.notStrictEqual(contractId, 0, 'Expected a valid contractId to be returned');
        });
        await it('adds a contract comment', () => {
            contractCommentId = addContractComment({
                contractId,
                comment: 'Test comment',
                commentDateString: '2024-01-01',
                commentTimeString: '09:00'
            }, testUser);
            assert.notStrictEqual(contractCommentId, 0, 'Expected a valid contractCommentId to be returned');
        });
        await it('adds a contract interment', () => {
            intermentNumber = addContractInterment({
                contractId,
                deceasedName: 'Test Deceased'
            }, testUser);
            assert.notStrictEqual(intermentNumber, 0, 'Expected a valid intermentNumber to be returned');
        });
        await it('adds a contract service type', () => {
            const success = addContractServiceType({
                contractId,
                serviceTypeId: 1
            }, testUser);
            assert.ok(success, 'Expected addContractServiceType() to succeed');
        });
        await it('adds a contract transaction', () => {
            transactionIndex = addContractTransaction({
                contractId,
                transactionAmount: 100,
                externalReceiptNumber: 'REC001',
                transactionNote: 'Test transaction'
            }, testUser);
            assert.strictEqual(transactionIndex, 0, 'Expected first transaction to have index 0');
        });
        await it('retrieves the created contract', async () => {
            const contract = await getContract(contractId);
            assert.notStrictEqual(contract, undefined, 'Expected contract to be retrievable');
            assert.strictEqual(contract?.purchaserName, 'Test Purchaser', 'Expected purchaser name to match');
        });
        await it('updates the contract comment', () => {
            const success = updateContractComment({
                contractCommentId,
                comment: 'Updated comment',
                commentDateString: '2024-01-02',
                commentTimeString: '10:00'
            }, testUser);
            assert.ok(success, 'Expected updateContractComment() to succeed');
        });
        await it('updates the contract interment', () => {
            const success = updateContractInterment({
                contractId,
                intermentNumber,
                deceasedName: 'Updated Deceased',
                deceasedAddress1: '',
                deceasedAddress2: '',
                deceasedCity: '',
                deceasedPostalCode: '',
                deceasedProvince: '',
                birthDateString: '',
                birthPlace: '',
                deathDateString: '',
                deathPlace: '',
                deathAge: '',
                deathAgePeriod: '',
                intermentContainerTypeId: '',
                intermentDepthId: ''
            }, testUser);
            assert.ok(success, 'Expected updateContractInterment() to succeed');
        });
        await it('updates the contract transaction', () => {
            const success = updateContractTransaction({
                contractId,
                transactionIndex,
                transactionAmount: 200,
                externalReceiptNumber: 'REC002',
                transactionNote: 'Updated transaction',
                transactionDateString: '2024-01-02',
                transactionTimeString: '10:00'
            }, testUser);
            assert.ok(success, 'Expected updateContractTransaction() to succeed');
        });
        await it('updates the contract', () => {
            const success = updateContract({
                contractId,
                contractTypeId: 1,
                burialSiteId,
                contractStartDateString: '2024-02-01',
                contractEndDateString: '',
                funeralDirectorName: '',
                funeralDateString: '',
                funeralTimeString: '',
                purchaserName: 'Updated Purchaser'
            }, testUser);
            assert.ok(success, 'Expected updateContract() to succeed');
        });
        await it('deletes the contract interment', () => {
            const success = deleteContractInterment(contractId, intermentNumber, testUser);
            assert.ok(success, 'Expected deleteContractInterment() to succeed');
        });
        await it('deletes the contract service type', () => {
            const success = deleteContractServiceType(contractId, 1, testUser);
            assert.ok(success, 'Expected deleteContractServiceType() to succeed');
        });
        await it('deletes the contract transaction', () => {
            const success = deleteContractTransaction(contractId, transactionIndex, testUser);
            assert.ok(success, 'Expected deleteContractTransaction() to succeed');
        });
        await it('deletes the contract', () => {
            const success = deleteContract(contractId, testUser);
            assert.ok(success, 'Expected deleteContract() to succeed');
        });
        await it('confirms the contract is deleted', async () => {
            const contract = await getContract(contractId);
            assert.strictEqual(contract, undefined, 'Expected deleted contract to be undefined');
        });
    });
});
