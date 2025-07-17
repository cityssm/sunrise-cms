import assert from 'node:assert';
import fs from 'node:fs';
import { describe, it } from 'node:test';
import * as userFunctions from '../helpers/functions.user.js';
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
