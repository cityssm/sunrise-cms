import getUserFromDatabase from '../database/getUser.js';
import getUserSettings from '../database/getUserSettings.js';
import { getUsernameFromApiKey } from './cache/apiKeys.cache.js';
import { getConfigProperty } from './config.helpers.js';
export function apiKeyIsValid(request) {
    const apiKey = request.params?.apiKey;
    if (apiKey === undefined) {
        return false;
    }
    const username = getUsernameFromApiKey(apiKey)?.toLowerCase();
    if (username === undefined) {
        return false;
    }
    return getConfigProperty('users.canLogin').some((currentUsername) => username === currentUsername.toLowerCase());
}
export function userCanUpdateCemeteries(request) {
    return request.session?.user?.userProperties.canUpdateCemeteries ?? false;
}
export function userCanUpdateContracts(request) {
    return request.session?.user?.userProperties.canUpdateContracts ?? false;
}
export function userCanUpdateWorkOrders(request) {
    return request.session?.user?.userProperties.canUpdateWorkOrders ?? false;
}
export function userIsAdmin(request) {
    return request.session?.user?.userProperties.isAdmin ?? false;
}
export function getUser(username) {
    const usernameLowerCase = username.toLowerCase();
    const localUser = getUserFromDatabase(usernameLowerCase);
    if (localUser?.isActive ?? false) {
        const userSettings = getUserSettings(username);
        return {
            username: usernameLowerCase,
            userProperties: {
                canUpdateCemeteries: localUser?.canUpdateCemeteries ?? false,
                canUpdateContracts: localUser?.canUpdateContracts ?? false,
                canUpdateWorkOrders: localUser?.canUpdateWorkOrders ?? false,
                isAdmin: localUser?.isAdmin ?? false
            },
            userSettings
        };
    }
    const canLogin = localUser === undefined &&
        getConfigProperty('users.canLogin').some((currentUsername) => usernameLowerCase === currentUsername.toLowerCase());
    if (canLogin) {
        const canUpdateAll = getConfigProperty('users.canUpdate').some((currentUsername) => usernameLowerCase === currentUsername.toLowerCase());
        const canUpdateCemeteries = canUpdateAll ||
            getConfigProperty('users.canUpdateCemeteries').some((currentUsername) => usernameLowerCase === currentUsername.toLowerCase());
        const canUpdateContracts = canUpdateAll ||
            getConfigProperty('users.canUpdateContracts').some((currentUsername) => usernameLowerCase === currentUsername.toLowerCase());
        const canUpdateWorkOrders = canUpdateAll ||
            getConfigProperty('users.canUpdateWorkOrders').some((currentUsername) => usernameLowerCase === currentUsername.toLowerCase());
        const isAdmin = getConfigProperty('users.isAdmin').some((currentUsername) => usernameLowerCase === currentUsername.toLowerCase());
        const userSettings = getUserSettings(username);
        return {
            username: usernameLowerCase,
            userProperties: {
                canUpdateCemeteries,
                canUpdateContracts,
                canUpdateWorkOrders,
                isAdmin
            },
            userSettings
        };
    }
    return undefined;
}
