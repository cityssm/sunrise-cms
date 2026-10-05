import Debug from 'debug';
import { doDataSyncEndpoint } from 'sunrise-cms-shared';
import updateSetting from '../../database/updateSetting.js';
import { DEBUG_ENABLE_NAMESPACES, DEBUG_NAMESPACE } from '../../debug.config.js';
import { getEndpointUrl } from './api.helpers.js';
import getSyncData from './database/getSyncData.js';
if (process.env.NODE_ENV === 'development') {
    Debug.enable(DEBUG_ENABLE_NAMESPACES);
}
const debug = Debug(`${DEBUG_NAMESPACE}:syncDataToPortal`);
const syncUrl = getEndpointUrl(doDataSyncEndpoint);
const syncErrorSettingKey = 'integrations.portal.syncError';
async function syncDataToPortal() {
    debug('Starting sync to portal');
    const syncData = getSyncData();
    debug('Sync data retrieved', syncData);
    try {
        const syncResponse = await fetch(syncUrl, {
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify(syncData)
        });
        debug('Sync response received', syncResponse);
        if (!syncResponse.ok && syncResponse.status !== 403) {
            throw new Error(`Sync failed with status ${syncResponse.status}`);
        }
        const syncResult = (await syncResponse.json());
        debug('Sync result', syncResult);
        updateSetting({
            settingKey: syncErrorSettingKey,
            settingValue: ''
        });
    }
    catch (error) {
        debug('Error occurred during sync', error);
        updateSetting({
            settingKey: syncErrorSettingKey,
            settingValue: error.message
        });
    }
}
void syncDataToPortal();
