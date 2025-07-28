import { getUserNameFromApiKey } from './cache/apiKeys.cache.js';
import { getConfigProperty } from './config.helpers.js';
export function apiKeyIsValid(request) {
    const apiKey = request.params?.apiKey;
    // eslint-disable-next-line security/detect-possible-timing-attacks
    if (apiKey === undefined) {
        return false;
    }
    const userName = getUserNameFromApiKey(apiKey);
    if (userName === undefined) {
        return false;
    }
    return getConfigProperty('users.canLogin').some((currentUserName) => userName === currentUserName.toLowerCase());
}
export function userCanUpdate(request) {
    return request.session?.user?.userProperties?.canUpdate ?? false;
}
export function userCanUpdateWorkOrders(request) {
    return request.session?.user?.userProperties?.canUpdateWorkOrders ?? false;
}
export function userIsAdmin(request) {
    return request.session?.user?.userProperties?.isAdmin ?? false;
}
