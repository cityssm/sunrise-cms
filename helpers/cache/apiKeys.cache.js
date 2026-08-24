import getApiKeys from '../../database/getApiKeys.js';
let apiKeys = {};
export function getCachedApiKeys() {
    if (Object.keys(apiKeys).length === 0) {
        apiKeys = getApiKeys();
    }
    return apiKeys;
}
export function getApiKeyByUsername(username) {
    const cachedKeys = getCachedApiKeys();
    return cachedKeys[username];
}
export function getUsernameFromApiKey(apiKey) {
    const cachedKeys = getCachedApiKeys();
    return Object.keys(cachedKeys).find((username) => cachedKeys[username] === apiKey);
}
export function clearApiKeysCache() {
    apiKeys = {};
}
