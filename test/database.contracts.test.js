import assert from 'node:assert';
import { after, before, describe, it } from 'node:test';
import sqlite from 'better-sqlite3';
import addBurialSite from '../database/addBurialSite.js';
import addCemetery from '../database/addCemetery.js';
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
    username: 'testUser',
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
        try {
            await getContract(1, database);
        }
        catch (error) {
            assert.fail(`getContract() threw an error: ${error}`);
        }
    });
    await it('can execute getContractAttachment()', () => {
        try {
            getContractAttachment(1, database);
        }
        catch (error) {
            assert.fail(`getContractAttachment() threw an error: ${error}`);
        }
    });
    await it('can execute getContractAttachments()', () => {
        try {
            getContractAttachments(1, database);
        }
        catch (error) {
            assert.fail(`getContractAttachments() threw an error: ${error}`);
        }
    });
    await it('can execute getContractComments()', () => {
        try {
            getContractComments(1, database);
        }
        catch (error) {
            assert.fail(`getContractComments() threw an error: ${error}`);
        }
    });
    await it('can execute getContractFees()', () => {
        try {
            getContractFees(1, database);
        }
        catch (error) {
            assert.fail(`getContractFees() threw an error: ${error}`);
        }
    });
    await it('can execute getContractFields()', () => {
        try {
            getContractFields(1, database);
        }
        catch (error) {
            assert.fail(`getContractFields() threw an error: ${error}`);
        }
    });
    await it('can execute getContractInterments()', () => {
        try {
            getContractInterments(1, database);
        }
        catch (error) {
            assert.fail(`getContractInterments() threw an error: ${error}`);
        }
    });
    await it('can execute getContractMetadataByContractId()', () => {
        try {
            getContractMetadataByContractId(1, '', database);
        }
        catch (error) {
            assert.fail(`getContractMetadataByContractId() threw an error: ${error}`);
        }
    });
    await it('can execute getContractTransactions()', async () => {
        try {
            await getContractTransactions(1, { includeIntegrations: true }, database);
        }
        catch (error) {
            assert.fail(`getContractTransactions() threw an error: ${error}`);
        }
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
            try {
                await getContracts({}, options, database);
            }
            catch (error) {
                assert.fail(`getContracts() threw an error: ${error}`);
            }
        });
        await it('executes with burialSiteId filter', async () => {
            try {
                await getContracts({ burialSiteId: '1' }, options, database);
            }
            catch (error) {
                assert.fail(`getContracts() threw an error: ${error}`);
            }
        });
        await it('executes with contractEffectiveDateString filter', async () => {
            try {
                await getContracts({ contractEffectiveDateString: '2023-01-01' }, options, database);
            }
            catch (error) {
                assert.fail(`getContracts() threw an error: ${error}`);
            }
        });
        await it('executes with contractStartDateString filter', async () => {
            try {
                await getContracts({ contractStartDateString: '2023-01-01' }, options, database);
            }
            catch (error) {
                assert.fail(`getContracts() threw an error: ${error}`);
            }
        });
        await it('executes with contractTime filter', async () => {
            try {
                await getContracts({ contractTime: 'current' }, options, database);
            }
            catch (error) {
                assert.fail(`getContracts() threw an error: ${error}`);
            }
        });
        await it('executes with cemeteryId filter', async () => {
            try {
                await getContracts({ cemeteryId: '1' }, options, database);
            }
            catch (error) {
                assert.fail(`getContracts() threw an error: ${error}`);
            }
        });
        await it('executes with contractTypeId filter', async () => {
            try {
                await getContracts({ contractTypeId: '1' }, options, database);
            }
            catch (error) {
                assert.fail(`getContracts() threw an error: ${error}`);
            }
        });
        await it('executes with deceasedName filter', async () => {
            try {
                await getContracts({ deceasedName: 'John Doe' }, options, database);
            }
            catch (error) {
                assert.fail(`getContracts() threw an error: ${error}`);
            }
        });
        await it('executes with purchaserName filter', async () => {
            try {
                await getContracts({ purchaserName: 'Jane Doe' }, options, database);
            }
            catch (error) {
                assert.fail(`getContracts() threw an error: ${error}`);
            }
        });
        await it('executes with burialSiteName filter', async () => {
            try {
                await getContracts({ burialSiteName: 'CEM' }, options, database);
            }
            catch (error) {
                assert.fail(`getContracts() threw an error: ${error}`);
            }
        });
        await it('executes with burialSiteTypeId filter', async () => {
            try {
                await getContracts({ burialSiteTypeId: '1' }, options, database);
            }
            catch (error) {
                assert.fail(`getContracts() threw an error: ${error}`);
            }
        });
        await it('executes with funeralHomeId filter', async () => {
            try {
                await getContracts({ funeralHomeId: '1' }, options, database);
            }
            catch (error) {
                assert.fail(`getContracts() threw an error: ${error}`);
            }
        });
        await it('executes with funeralTime filter', async () => {
            try {
                await getContracts({ funeralTime: 'upcoming' }, options, database);
            }
            catch (error) {
                assert.fail(`getContracts() threw an error: ${error}`);
            }
        });
        await it('executes with workOrderId filter', async () => {
            try {
                await getContracts({ workOrderId: '1' }, options, database);
            }
            catch (error) {
                assert.fail(`getContracts() threw an error: ${error}`);
            }
        });
        await it('executes with notWorkOrderId filter', async () => {
            try {
                await getContracts({ notWorkOrderId: '1' }, options, database);
            }
            catch (error) {
                assert.fail(`getContracts() threw an error: ${error}`);
            }
        });
        await it('executes with notContractId filter', async () => {
            try {
                await getContracts({ notContractId: '1' }, options, database);
            }
            catch (error) {
                assert.fail(`getContracts() threw an error: ${error}`);
            }
        });
        await it('executes with relatedContractId filter', async () => {
            try {
                await getContracts({ relatedContractId: '1' }, options, database);
            }
            catch (error) {
                assert.fail(`getContracts() threw an error: ${error}`);
            }
        });
        await it('executes with notRelatedContractId filter', async () => {
            try {
                await getContracts({ notRelatedContractId: '1' }, options, database);
            }
            catch (error) {
                assert.fail(`getContracts() threw an error: ${error}`);
            }
        });
    });
    await it('can execute getPreviousContractId()', () => {
        try {
            getPreviousContractId(1, database);
        }
        catch (error) {
            assert.fail(`getPreviousContractId() threw an error: ${error}`);
        }
    });
    await it('can execute getNextContractId()', () => {
        try {
            getNextContractId(1, database);
        }
        catch (error) {
            assert.fail(`getNextContractId() threw an error: ${error}`);
        }
    });
    await describe('Contract Workflow', async () => {
        let cemeteryId;
        let burialSiteId;
        let contractId;
        let contractCommentId;
        let transactionIndex;
        let intermentNumber;
        before(() => {
            cemeteryId = addCemetery({
                cemeteryName: 'Test Cemetery',
                cemeteryKey: 'CEM',
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
                cemeteryPhoneNumber: '',
                findagraveCemeteryId: ''
            }, testUser);
            const burialSiteResult = addBurialSite({
                cemeteryId,
                burialSiteNameSegment1: 'A',
                burialSiteNameSegment2: '1',
                burialSiteStatusId: 1,
                burialSiteTypeId: 1
            }, testUser);
            burialSiteId = burialSiteResult.burialSiteId;
        });
        await it('creates a contract', () => {
            contractId = addContract({
                contractTypeId: 1,
                burialSiteId,
                contractStartDateString: '2024-01-01',
                contractEndDateString: '',
                funeralDirectorName: '',
                purchaserName: 'Test Purchaser',
                purchaserAddress1: '',
                purchaserAddress2: '',
                purchaserCity: '',
                purchaserProvince: '',
                purchaserPostalCode: '',
                purchaserEmail: '',
                purchaserPhoneNumber: '',
                purchaserRelationship: ''
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
            const isContractServiceTypeAdded = addContractServiceType({
                contractId,
                serviceTypeId: 1
            }, testUser);
            assert.ok(isContractServiceTypeAdded, 'Expected addContractServiceType() to succeed');
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
            const isCommentUpdated = updateContractComment({
                contractCommentId,
                comment: 'Updated comment',
                commentDateString: '2024-01-02',
                commentTimeString: '10:00'
            }, testUser);
            assert.ok(isCommentUpdated, 'Expected updateContractComment() to succeed');
        });
        await it('updates the contract interment', () => {
            const isContractUpdated = updateContractInterment({
                contractId,
                intermentNumber,
                deceasedName: 'Updated Deceased',
                deceasedAddress1: '',
                deceasedAddress2: '',
                deceasedCity: '',
                deceasedPostalCode: '',
                deceasedProvince: '',
                birthYear: '',
                birthMonth: '',
                birthDay: '',
                birthPlace: '',
                deathYear: '',
                deathMonth: '',
                deathDay: '',
                deathPlace: '',
                deathAge: '',
                deathAgePeriod: '',
                intermentContainerTypeId: '',
                intermentDepthId: '',
                findagraveMemorialId: ''
            }, testUser);
            assert.ok(isContractUpdated, 'Expected updateContractInterment() to succeed');
        });
        await it('updates the contract transaction', () => {
            const isTransactionUpdated = updateContractTransaction({
                contractId,
                transactionIndex,
                transactionAmount: 200,
                externalReceiptNumber: 'REC002',
                transactionNote: 'Updated transaction',
                transactionDateString: '2024-01-02',
                transactionTimeString: '10:00'
            }, testUser);
            assert.ok(isTransactionUpdated, 'Expected updateContractTransaction() to succeed');
        });
        await it('updates the contract', () => {
            const isContractUpdated = updateContract({
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
            assert.ok(isContractUpdated, 'Expected updateContract() to succeed');
        });
        await it('deletes the contract interment', () => {
            const isContractIntermentDeleted = deleteContractInterment(contractId, intermentNumber, testUser);
            assert.ok(isContractIntermentDeleted, 'Expected deleteContractInterment() to succeed');
        });
        await it('deletes the contract service type', () => {
            const isContractServiceTypeDeleted = deleteContractServiceType(contractId, 1, testUser);
            assert.ok(isContractServiceTypeDeleted, 'Expected deleteContractServiceType() to succeed');
        });
        await it('deletes the contract transaction', () => {
            const isContractTransactionDeleted = deleteContractTransaction(contractId, transactionIndex, testUser);
            assert.ok(isContractTransactionDeleted, 'Expected deleteContractTransaction() to succeed');
        });
        await it('deletes the contract', () => {
            const isContractDeleted = deleteContract(contractId, testUser);
            assert.ok(isContractDeleted, 'Expected deleteContract() to succeed');
        });
        await it('confirms the contract is deleted', async () => {
            const contract = await getContract(contractId);
            assert.strictEqual(contract, undefined, 'Expected deleted contract to be undefined');
        });
    });
});
