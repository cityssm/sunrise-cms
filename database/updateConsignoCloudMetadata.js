import { DatabaseSync } from 'node:sqlite';
import { sunriseDB } from '../helpers/database.helpers.js';
import updateContractMetadata from './updateContractMetadata.js';
export default function updateConsignoCloudMetadata(contractId, metadata, user, connectedDatabase) {
    const database = connectedDatabase ?? new DatabaseSync(sunriseDB);
    updateContractMetadata(contractId, {
        metadataKey: 'consignoCloud.workflowId',
        metadataValue: metadata.workflowId
    }, user, database);
    updateContractMetadata(contractId, {
        metadataKey: 'consignoCloud.workflowStatus',
        metadataValue: metadata.workflowStatus.toString()
    }, user, database);
    updateContractMetadata(contractId, {
        metadataKey: 'consignoCloud.workflowEditUrl',
        metadataValue: metadata.workflowEditUrl
    }, user, database);
    updateContractMetadata(contractId, {
        metadataKey: 'consignoCloud.workflowUser',
        metadataValue: user.username
    }, user, database);
    if (connectedDatabase === undefined) {
        database.close();
    }
    return true;
}
