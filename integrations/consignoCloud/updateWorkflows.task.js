import { ScheduledTask } from '@cityssm/scheduled-task';
import { minutesToMillis } from '@cityssm/to-millis';
import Debug from 'debug';
import { Range } from 'node-schedule';
import getConsignoCloudContractMetadata from '../../database/getConsignoCloudContractMetadata.js';
import { DEBUG_ENABLE_NAMESPACES } from '../../debug.config.js';
import pollWorkflow, { clearApiCache } from './pollWorkflow.js';
if (process.env.NODE_ENV === 'development') {
    Debug.enable(DEBUG_ENABLE_NAMESPACES);
}
const taskName = 'Update Consigno Workflows Task';
const taskUser = {
    userName: 'task.updateConsignoWorkflows',
    userProperties: {
        canUpdateCemeteries: false,
        canUpdateContracts: true,
        canUpdateWorkOrders: false,
        isAdmin: false
    },
    userSettings: {}
};
async function updateConsignoWorkflows() {
    const consignoCloudMetadata = getConsignoCloudContractMetadata();
    for (const [contractId, metadata] of Object.entries(consignoCloudMetadata)) {
        await pollWorkflow({
            contractId,
            metadata
        }, taskUser);
    }
    clearApiCache();
}
const scheduledTask = new ScheduledTask(taskName, updateConsignoWorkflows, {
    schedule: {
        hour: new Range(0, 23),
        minute: 0,
        second: 0
    },
    minimumIntervalMillis: minutesToMillis(10),
    startTask: true
});
await scheduledTask.runTask();
