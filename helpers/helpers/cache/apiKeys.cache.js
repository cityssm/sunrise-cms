import getApiKeys from '../../database/getApiKeys.js';
let apiKeys = {};
export function getCachedApiKeys() {
    if (Object.keys(apiKeys).length === 0) {
        apiKeys = getApiKeys();
    }
    return apiKeys;
}
export function getApiKeyByUserName(userName) {
    const cachedKeys = getCachedApiKeys();
    // eslint-disable-next-line security/detect-object-injection
    return cachedKeys[userName];
}
export function getUserNameFromApiKey(apiKey) {
    const cachedKeys = getCachedApiKeys();
    return Object.keys(cachedKeys).find(
    // eslint-disable-next-line security/detect-object-injection
    (userName) => cachedKeys[userName] === apiKey);
}
export function clearApiKeysCache() {
    apiKeys = {};
}
