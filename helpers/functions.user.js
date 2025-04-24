import { getConfigProperty } from './config.helpers.js';
import { getUserNameFromApiKey } from './functions.api.js';
export async function apiKeyIsValid(request) {
    const apiKey = request.params?.apiKey;
    if (apiKey === undefined) {
        return false;
    }
    const userName = await getUserNameFromApiKey(apiKey);
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
