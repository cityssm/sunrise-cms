import { randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import Debug from 'debug';
import { DEBUG_NAMESPACE } from '../debug.config.js';
const debug = Debug(`${DEBUG_NAMESPACE}:functions.api`);
const apiKeyPath = 'data/apiKeys.json';
let apiKeys;
export async function getApiKey(userName) {
    apiKeys ??= await loadApiKeys();
    if (!Object.hasOwn(apiKeys, userName)) {
        await regenerateApiKey(userName);
    }
    return apiKeys[userName];
}
export async function getApiKeyFromUser(user) {
    return await getApiKey(user.userName);
}
export async function getUserNameFromApiKey(apiKey) {
    apiKeys ??= await loadApiKeys();
    for (const [userName, currentApiKey] of Object.entries(apiKeys)) {
        if (apiKey === currentApiKey) {
            return userName;
        }
    }
    return undefined;
}
export async function regenerateApiKey(userName) {
    apiKeys ??= await loadApiKeys();
    apiKeys[userName] = generateApiKey(userName);
    await saveApiKeys();
}
function generateApiKey(apiKeyPrefix) {
    return `${apiKeyPrefix}-${randomUUID()}-${Date.now().toString()}`;
}
async function loadApiKeys() {
    try {
        const fileData = await fs.readFile(apiKeyPath, 'utf8');
        apiKeys = JSON.parse(fileData);
    }
    catch (error) {
        debug(error);
        apiKeys = {};
    }
    return apiKeys;
}
async function saveApiKeys() {
    try {
        await fs.writeFile(apiKeyPath, JSON.stringify(apiKeys), 'utf8');
    }
    catch (error) {
        debug(error);
    }
}
