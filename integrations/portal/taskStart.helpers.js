import { fork } from 'node:child_process';
import { debuglog } from 'node:util';
import { DEBUG_NAMESPACE } from '../../debug.config.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
const debug = debuglog(`${DEBUG_NAMESPACE}:integrations:portal:taskStart`);
const canRunSyncDataToPortalTask = getConfigProperty('integrations.portal.integrationIsEnabled') &&
    getConfigProperty('integrations.portal.apiKey') !== '' &&
    getConfigProperty('integrations.portal.apiUrl') !== '';
export function startSyncDataToPortalTask() {
    if (!canRunSyncDataToPortalTask) {
        return;
    }
    const process = fork('./integrations/portal/syncDataToPortal.task.js');
    process.on('exit', (code) => {
        debug(`SyncDataToPortal task exited with code ${code}`);
    });
}
