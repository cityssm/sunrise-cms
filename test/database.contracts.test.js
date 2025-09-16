import { describe, it } from 'node:test';
import sqlite from 'better-sqlite3';
import getContract from '../database/getContract.js';
import getContractAttachment from '../database/getContractAttachment.js';
import getContractAttachments from '../database/getContractAttachments.js';
import getContractComments from '../database/getContractComments.js';
import getContractFees from '../database/getContractFees.js';
import getContractFields from '../database/getContractFields.js';
import getContractInterments from '../database/getContractInterments.js';
import getContractMetadataByContractId from '../database/getContractMetadataByContractId.js';
import getContractTransactions from '../database/getContractTransactions.js';
import getNextContractId from '../database/getNextContractId.js';
import getPreviousContractId from '../database/getPreviousContractId.js';
import { sunriseDB } from '../helpers/database.helpers.js';
await describe('database/contracts', async () => {
    const database = sqlite(sunriseDB, { readonly: true });
    after(() => {
        database.close();
    });
    await it('can execute getContract()', async () => {
        await getContract(1, database);
        assert.ok(true);
    });
    await it('can execute getContractAttachment()', () => {
        getContractAttachment(1, database);
        assert.ok(true);
    });
    await it('can execute getContractAttachments()', () => {
        getContractAttachments(1, database);
        assert.ok(true);
    });
    await it('can execute getContractComments()', () => {
        getContractComments(1, database);
        assert.ok(true);
    });
    await it('can execute getContractComments()', () => {
        getContractComments(1, database);
        assert.ok(true);
    });
    await it('can execute getContractFees()', () => {
        getContractFees(1, database);
        assert.ok(true);
    });
    await it('can execute getContractFields()', () => {
        getContractFields(1, database);
        assert.ok(true);
    });
    await it('can execute getContractInterments()', () => {
        getContractInterments(1, database);
        assert.ok(true);
    });
    await it('can execute getContractMetadataByContractId()', () => {
        getContractMetadataByContractId(1, '', database);
        assert.ok(true);
    });
    await it('can execute getContractTransactions()', async () => {
        await getContractTransactions(1, { includeIntegrations: true }, database);
        assert.ok(true);
    });
    await it('can execute getPreviousContractId()', () => {
        getPreviousContractId(1, database);
        assert.ok(true);
    });
    await it('can execute getNextContractId()', () => {
        getNextContractId(1, database);
        assert.ok(true);
    });
});
