import { DatabaseSync } from 'node:sqlite';
import { sunriseDB } from '../helpers/database.helpers.js';
import deleteContractMetadata from './deleteContractMetadata.js';
export default function deleteConsignoCloudContractMetadata(contractId, user, connectedDatabase) {
    const database = connectedDatabase ?? new DatabaseSync(sunriseDB);
    const consignoCloudMetadataKeys = [
        'consignoCloud.workflowId',
        'consignoCloud.workflowStatus',
        'consignoCloud.workflowEditUrl',
        'consignoCloud.workflowUser'
    ];
    for (const metadataKey of consignoCloudMetadataKeys) {
        deleteContractMetadata(contractId, metadataKey, user, database);
    }
    if (connectedDatabase === undefined) {
        database.close();
    }
    return true;
}
