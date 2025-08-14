import { ConsignoCloudAPI, ConsignoCloudError } from '@cityssm/consigno-cloud-api';
import { WorkflowStatus } from '@cityssm/consigno-cloud-api/lookups.js';
import Debug from 'debug';
import addContractAttachment from '../../database/addContractAttachment.js';
import addContractComment from '../../database/addContractComment.js';
import deleteConsignoCloudContractMetadata from '../../database/deleteConsingoCloudContractMetadata.js';
import getUserSettings from '../../database/getUserSettings.js';
import updateContractMetadata from '../../database/updateContractMetadata.js';
import { DEBUG_NAMESPACE } from '../../debug.config.js';
import { writeAttachment } from '../../helpers/attachments.helpers.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
const debug = Debug(`${DEBUG_NAMESPACE}:integrations:consignoCloud:pollWorkflow`);
let apiCache = {};
export default async function pollWorkflow(workflow, user) {
    debug('Polling workflow for contract ID:', workflow.contractId);
    let consignoCloudAPI = apiCache[workflow.metadata.workflowUser];
    if (consignoCloudAPI === undefined) {
        debug('Creating new ConsignO Cloud API instance for user:', workflow.metadata.workflowUser);
        const userSettings = getUserSettings(workflow.metadata.workflowUser);
        consignoCloudAPI = new ConsignoCloudAPI({
            apiKey: getConfigProperty('integrations.consignoCloud.apiKey'),
            apiSecret: getConfigProperty('integrations.consignoCloud.apiSecret'),
            baseUrl: getConfigProperty('integrations.consignoCloud.baseUrl')
        }).setLoginAs(userSettings['consignoCloud.userName'] ?? '', userSettings['consignoCloud.thirdPartyApplicationPassword'] ?? '');
        apiCache[workflow.metadata.workflowUser] = consignoCloudAPI;
    }
    else {
        debug('Using cached ConsignO Cloud API instance for user:', workflow.metadata.workflowUser);
    }
    /*
     * Get the current workflow status
     */
    debug('Polling workflow', workflow.metadata.workflowId);
    let purgeMetadata = false;
    try {
        const currentWorkflow = await consignoCloudAPI.getWorkflow(workflow.metadata.workflowId);
        /*
         * If the workflow status has changed, update the metadata
         */
        debug('Current workflow status:', currentWorkflow.response.status);
        if (workflow.metadata.workflowStatus !==
            currentWorkflow.response.status.toString()) {
            workflow.metadata.workflowStatus =
                currentWorkflow.response.status.toString();
            updateContractMetadata(workflow.contractId, {
                metadataKey: 'consignoCloud.workflowStatus',
                metadataValue: workflow.metadata.workflowStatus
            }, user);
            addContractComment({
                comment: `ConsignO Cloud workflow status updated to "${WorkflowStatus[workflow.metadata.workflowStatus]}"`,
                contractId: workflow.contractId
            }, user);
        }
        /*
         * If the workflow is completed successfully, download the documents
         */
        const workflowStatusString = WorkflowStatus[currentWorkflow.response.status];
        if (workflowStatusString === 'Completed') {
            debug('Workflow completed successfully, downloading documents and audit trail');
            // Documents
            const workflowDocuments = await consignoCloudAPI.downloadDocuments(workflow.metadata.workflowId);
            const documentsFileName = `Contract ${workflow.contractId} (Workflow ${workflow.metadata.workflowId}) - Documents.${workflowDocuments.contentType === 'application/pdf' ? 'pdf' : 'zip'}`;
            const documentsAttachment = await writeAttachment(documentsFileName, workflowDocuments.data);
            addContractAttachment({
                contractId: workflow.contractId,
                fileName: documentsAttachment.fileName,
                filePath: documentsAttachment.filePath,
                attachmentTitle: `ConsignO Cloud Workflow Documents (${workflow.metadata.workflowId})`
            }, user);
            // Audit Trail
            const workflowAuditTrail = await consignoCloudAPI.downloadAuditTrail(workflow.metadata.workflowId);
            const auditTrailFileName = `Contract ${workflow.contractId} (Workflow ${workflow.metadata.workflowId}) - Audit Trail.pdf`;
            const auditTrailAttachment = await writeAttachment(auditTrailFileName, workflowAuditTrail.data);
            addContractAttachment({
                contractId: workflow.contractId,
                fileName: auditTrailAttachment.fileName,
                filePath: auditTrailAttachment.filePath,
                attachmentTitle: `ConsignO Cloud Workflow Audit Trail (${workflow.metadata.workflowId})`
            }, user);
        }
        /*
         * If the workflow has no remaining actions, clear the metadata
         */
        if (workflowStatusString === 'Deleted' ||
            currentWorkflow.response.remainingActions === 0) {
            purgeMetadata = true;
        }
    }
    catch (error) {
        debug('Error polling workflow:', error);
        // ENTITY_NOT_FOUND indicates the workflow does not exist
        if (error instanceof ConsignoCloudError && error.errorCode === '5004') {
            purgeMetadata = true;
        }
    }
    if (purgeMetadata) {
        debug('Workflow has no remaining actions, clearing metadata');
        deleteConsignoCloudContractMetadata(workflow.contractId, user);
        return true;
    }
    return false;
}
export function clearApiCache() {
    debug('Clearing ConsignO Cloud API cache');
    apiCache = {};
}
