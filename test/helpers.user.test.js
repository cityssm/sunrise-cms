import assert from 'node:assert';
import { describe, it } from 'node:test';
import { getCachedApiKeys } from '../helpers/cache/apiKeys.cache.js';
import * as userFunctions from '../helpers/user.helpers.js';
import { testAdmin, testUpdate, testView } from './_globals.js';
await describe('helpers.user', async () => {
    await describe('unauthenticated, no user in session', async () => {
        const noUserRequest = {
            session: {}
        };
        await it('can not update', () => {
            assert.strictEqual(userFunctions.canUserUpdateContracts(noUserRequest), false);
        });
        await it('is not admin', () => {
            assert.strictEqual(userFunctions.isUserAdmin(noUserRequest), false);
        });
    });
    await describe('read only user, no update, no admin', async () => {
        const readOnlyRequest = {
            session: {
                user: {
                    username: '*test',
                    userProperties: {
                        canUpdateCemeteries: false,
                        canUpdateContracts: false,
                        canUpdateWorkOrders: false,
                        isAdmin: false
                    },
                    userSettings: {}
                }
            }
        };
        await it('can not update', () => {
            assert.strictEqual(userFunctions.canUserUpdateCemeteries(readOnlyRequest), false);
            assert.strictEqual(userFunctions.canUserUpdateContracts(readOnlyRequest), false);
            assert.strictEqual(userFunctions.canUserUpdateWorkOrders(readOnlyRequest), false);
        });
        await it('is not admin', () => {
            assert.strictEqual(userFunctions.isUserAdmin(readOnlyRequest), false);
        });
    });
    await describe('update only user, no admin', async () => {
        const updateOnlyRequest = {
            session: {
                user: {
                    username: '*test',
                    userProperties: {
                        canUpdateCemeteries: true,
                        canUpdateContracts: true,
                        canUpdateWorkOrders: true,
                        isAdmin: false
                    },
                    userSettings: {}
                }
            }
        };
        await it('can update', () => {
            assert.strictEqual(userFunctions.canUserUpdateCemeteries(updateOnlyRequest), true);
            assert.strictEqual(userFunctions.canUserUpdateContracts(updateOnlyRequest), true);
            assert.strictEqual(userFunctions.canUserUpdateWorkOrders(updateOnlyRequest), true);
        });
        await it('is not admin', () => {
            assert.strictEqual(userFunctions.isUserAdmin(updateOnlyRequest), false);
        });
    });
    await describe('admin only user, no update', async () => {
        const adminOnlyRequest = {
            session: {
                user: {
                    username: '*test',
                    userProperties: {
                        canUpdateCemeteries: false,
                        canUpdateContracts: false,
                        canUpdateWorkOrders: false,
                        isAdmin: true
                    },
                    userSettings: {}
                }
            }
        };
        await it('can not update', () => {
            assert.strictEqual(userFunctions.canUserUpdateCemeteries(adminOnlyRequest), false);
            assert.strictEqual(userFunctions.canUserUpdateContracts(adminOnlyRequest), false);
            assert.strictEqual(userFunctions.canUserUpdateWorkOrders(adminOnlyRequest), false);
        });
        await it('is admin', () => {
            assert.strictEqual(userFunctions.isUserAdmin(adminOnlyRequest), true);
        });
    });
    await describe('update admin user', async () => {
        const updateAdminRequest = {
            session: {
                user: {
                    username: '*test',
                    userProperties: {
                        canUpdateCemeteries: true,
                        canUpdateContracts: true,
                        canUpdateWorkOrders: true,
                        isAdmin: true
                    },
                    userSettings: {}
                }
            }
        };
        await it('can update', () => {
            assert.strictEqual(userFunctions.canUserUpdateCemeteries(updateAdminRequest), true);
            assert.strictEqual(userFunctions.canUserUpdateContracts(updateAdminRequest), true);
            assert.strictEqual(userFunctions.canUserUpdateWorkOrders(updateAdminRequest), true);
        });
        await it('is admin', () => {
            assert.strictEqual(userFunctions.isUserAdmin(updateAdminRequest), true);
        });
    });
    await describe('API key check', async () => {
        await it('authenticates with a valid API key', () => {
            let apiKeys = getCachedApiKeys();
            if (Object.keys(apiKeys).length === 0) {
                userFunctions.getUser(testAdmin);
                userFunctions.getUser(testUpdate);
                userFunctions.getUser(testView);
                apiKeys = getCachedApiKeys();
            }
            assert.ok(Object.keys(apiKeys).length > 0, 'Expected API keys to be present');
            for (const apiKey of Object.values(apiKeys)) {
                const apiRequest = {
                    params: {
                        apiKey
                    }
                };
                assert.strictEqual(userFunctions.isApiKeyValid(apiRequest), true, `Expected API key '${apiKey}' to be valid`);
            }
        });
        await it('fails to authenticate with an invalid API key', () => {
            const apiRequest = {
                params: {
                    apiKey: 'badKey'
                }
            };
            assert.strictEqual(userFunctions.isApiKeyValid(apiRequest), false);
        });
        await it('fails to authenticate with no API key', () => {
            const apiRequest = {
                params: {}
            };
            assert.strictEqual(userFunctions.isApiKeyValid(apiRequest), false);
        });
    });
});
