import getUserSettings from '../database/getUserSettings.js';
import { getUserNameFromApiKey } from './cache/apiKeys.cache.js';
import { getConfigProperty } from './config.helpers.js';
export function apiKeyIsValid(request) {
    const apiKey = request.params?.apiKey;
    // eslint-disable-next-line security/detect-possible-timing-attacks
    if (apiKey === undefined) {
        return false;
    }
    const userName = getUserNameFromApiKey(apiKey)?.toLowerCase();
    if (userName === undefined) {
        return false;
    }
    return getConfigProperty('users.canLogin').some((currentUserName) => userName === currentUserName.toLowerCase());
}
export function userCanUpdate(request) {
    return request.session?.user?.userProperties.canUpdate ?? false;
}
export function userCanUpdateWorkOrders(request) {
    return request.session?.user?.userProperties.canUpdateWorkOrders ?? false;
}
export function userIsAdmin(request) {
    return request.session?.user?.userProperties.isAdmin ?? false;
}
export function getUser(userName) {
    const userNameLowerCase = userName.toLowerCase();
    const canLogin = getConfigProperty('users.canLogin').some((currentUserName) => userNameLowerCase === currentUserName.toLowerCase());
    if (canLogin) {
        const canUpdate = getConfigProperty('users.canUpdate').some((currentUserName) => userNameLowerCase === currentUserName.toLowerCase());
        const canUpdateWorkOrders = getConfigProperty('users.canUpdateWorkOrders').some((currentUserName) => userNameLowerCase === currentUserName.toLowerCase());
        const isAdmin = getConfigProperty('users.isAdmin').some((currentUserName) => userNameLowerCase === currentUserName.toLowerCase());
        const userSettings = getUserSettings(userName);
        return {
            userName: userNameLowerCase,
            userProperties: {
                canUpdate,
                canUpdateWorkOrders,
                isAdmin
            },
            userSettings
        };
    }
    return undefined;
}
