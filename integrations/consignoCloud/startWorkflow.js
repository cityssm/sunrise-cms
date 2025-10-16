import { ConsignoCloudAPI, utilities as consignoCloudUtilities } from '@cityssm/consigno-cloud-api';
import { CreateWorkflowStatuses, PDFAPolicies } from '@cityssm/consigno-cloud-api/lookups.js';
import addContractComment from '../../database/addContractComment.js';
import updateConsignoCloudMetadata from '../../database/updateConsignoCloudMetadata.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
import { generatePdf } from '../../helpers/pdf.helpers.js';
import { getPrintConfig } from '../../helpers/print.helpers.js';
import { userHasConsignoCloudAccess } from './helpers.js';
export default async function startConsignoCloudWorkflow(form, user) {
    const userIsAllowed = userHasConsignoCloudAccess(user);
    if (!userIsAllowed) {
        throw new Error('User does not have access to Consigno Cloud');
    }
    /*
     * Build the workflow definition
     */
    const workflowDefinition = {
        name: form.workflowTitle,
        expiresOn: form.workflowExpiresOn,
        pdfaPolicy: PDFAPolicies.Preferred,
        status: CreateWorkflowStatuses.Create,
        documents: [],
        actions: [
            {
                mode: 'remote',
                step: 1,
                zoneLabel: 'Sign Here',
                ref: '1',
                signer: {
                    type: 'esig',
                    firstName: form.signerFirstName,
                    lastName: form.signerLastName,
                    email: form.signerEmail,
                    phone: form.signerPhone,
                    amr: ['link', form.signerAmr],
                    placeHolder: false
                }
            }
        ],
        notifications: []
    };
    const printNames = Array.isArray(form.printNames)
        ? form.printNames
        : [form.printNames];
    for (const printName of printNames) {
        const printConfig = getPrintConfig(printName);
        if (printConfig === undefined) {
            throw new Error(`Print configuration not found for print: ${printName}`);
        }
        const pdfData = await generatePdf(printConfig, {
            contractId: form.contractId
        });
        const anchors = [];
        for (const anchor of printConfig.consignoCloud?.anchors ?? []) {
            anchors.push({
                tag: anchor.tag,
                xOffset: anchor.xOffset,
                yOffset: anchor.yOffset,
                height: anchor.height,
                width: anchor.width,
                assignedTo: '1',
                page: anchor.page,
                skipIfNotFound: true
            });
        }
        workflowDefinition.documents.push({
            name: printConfig.title,
            data: consignoCloudUtilities.uintArrayToBase64(pdfData),
            anchors
        });
    }
    /*
     * Create the workflow
     */
    const consignoCloudAPI = new ConsignoCloudAPI({
        apiKey: getConfigProperty('integrations.consignoCloud.apiKey'),
        apiSecret: getConfigProperty('integrations.consignoCloud.apiSecret'),
        baseUrl: getConfigProperty('integrations.consignoCloud.baseUrl')
    }).setLoginAs(user.userSettings['consignoCloud.userName'] ?? '', user.userSettings['consignoCloud.thirdPartyApplicationPassword'] ?? '');
    const workflowResponse = await consignoCloudAPI.createWorkflow(workflowDefinition);
    /*
     * Update the metadata
     */
    const workflowId = workflowResponse.response.id;
    const workflowStatus = workflowResponse.response.status;
    const workflowEditUrl = workflowResponse.response.editUrl;
    updateConsignoCloudMetadata(form.contractId, {
        workflowEditUrl,
        workflowId,
        workflowStatus
    }, user);
    /*
     * Add a comment to the contract
     */
    const comment = `ConsignO Cloud workflow created: ${workflowEditUrl}`;
    addContractComment({
        comment,
        contractId: form.contractId
    }, user);
    /*
     * Return the workflow ID and edit URL
     */
    return {
        workflowEditUrl,
        workflowId
    };
}
