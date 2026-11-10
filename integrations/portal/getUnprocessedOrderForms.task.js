import { debuglog } from 'node:util';
import { minutesToMillis } from '@cityssm/to-millis';
import exitHook from 'exit-hook';
import { doGetUnprocessedOrderFormsEndpoint, doMarkOrderFormAsSyncedEndpoint } from 'sunrise-cms-shared';
import updateSetting from '../../database/updateSetting.js';
import { DEBUG_NAMESPACE } from '../../debug.config.js';
import { getCachedSettingValue } from '../../helpers/cache/settings.cache.js';
import { getEndpointUrl } from './api.helpers.js';
import recordOrderForm from './database/recordOrderForm.js';
import updateOrderFormSyncMillis from './database/updateOrderFormSyncMillis.js';
import { startSyncDataToPortalTask } from './taskStart.helpers.js';
const taskName = 'Get Unprocessed Order Forms From Portal Task';
const debug = debuglog(`${DEBUG_NAMESPACE}:tasks:${taskName.toLowerCase().replaceAll(' ', '-')}`);
const getFormsEndpointUrl = getEndpointUrl(doGetUnprocessedOrderFormsEndpoint);
const updateFormEndpointUrl = getEndpointUrl(doMarkOrderFormAsSyncedEndpoint);
const syncErrorSettingKey = 'integrations.portal.syncError';
let isRunning = false;
async function getUnprocessedOrderForms() {
    debug('Starting to get unprocessed order forms from portal');
    try {
        const orderFormsResponse = await fetch(getFormsEndpointUrl, {
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'POST'
        });
        debug('Response received', orderFormsResponse);
        if (!orderFormsResponse.ok && orderFormsResponse.status !== 403) {
            throw new Error(`Failed to get unprocessed order forms with status ${orderFormsResponse.status}`);
        }
        const result = (await orderFormsResponse.json());
        debug('Unprocessed order forms retrieved', result);
        if (!result.success) {
            throw new Error(`Failed to get unprocessed order forms: ${result.error}`);
        }
        const unprocessedOrderForms = result.data.orderForms;
        debug('Processing unprocessed order forms', unprocessedOrderForms);
        for (const orderForm of unprocessedOrderForms) {
            debug('Processing order form', orderForm);
            recordOrderForm(orderForm);
            const updateFormResponse = await fetch(updateFormEndpointUrl, {
                headers: {
                    'Content-Type': 'application/json'
                },
                method: 'POST',
                body: JSON.stringify({
                    orderFormId: orderForm.orderFormId
                })
            });
            debug('Update form response received', updateFormResponse);
            if (!updateFormResponse.ok && updateFormResponse.status !== 403) {
                throw new Error(`Failed to update order form with status ${updateFormResponse.status}`);
            }
            const updateFormResult = (await updateFormResponse.json());
            debug('Update form result', updateFormResult);
            if (!updateFormResult.success) {
                throw new Error(`Failed to update order form: ${updateFormResult.error}`);
            }
            updateOrderFormSyncMillis(orderForm.orderFormKey, updateFormResult.data.recordSync_timeMillis);
        }
        const previousSettingValue = getCachedSettingValue(syncErrorSettingKey);
        updateSetting({
            settingKey: syncErrorSettingKey,
            settingValue: ''
        });
        if (previousSettingValue === '') {
            startSyncDataToPortalTask();
        }
    }
    catch (error) {
        debug('Error occurred while getting unprocessed order forms', error);
        updateSetting({
            settingKey: syncErrorSettingKey,
            settingValue: error.message
        });
    }
    if (process.send !== undefined) {
        process.send({
            messageType: 'clearCache',
            tableName: 'SunriseSettings',
            pid: process.pid,
            timeMillis: Date.now(),
        });
    }
}
await getUnprocessedOrderForms();
const intervalId = setInterval(() => {
    if (isRunning) {
        return;
    }
    isRunning = true;
    try {
        void getUnprocessedOrderForms();
    }
    finally {
        isRunning = false;
    }
}, minutesToMillis(3));
exitHook(() => {
    clearInterval(intervalId);
});
