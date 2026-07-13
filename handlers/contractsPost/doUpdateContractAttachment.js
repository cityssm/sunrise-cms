import getContract from '../../database/getContract.js';
import getContractAttachment from '../../database/getContractAttachment.js';
import getContractAttachments from '../../database/getContractAttachments.js';
import updateContractAttachment from '../../database/updateContractAttachment.js';
export default async function handler(request, response) {
    const contractAttachmentId = Number.parseInt(request.body.contractAttachmentId, 10);
    const attachment = getContractAttachment(contractAttachmentId);
    if (attachment === undefined) {
        response.json({
            success: false,
            errorMessage: 'Attachment not found.'
        });
        return;
    }
    const contractId = attachment.contractId;
    const contract = await getContract(contractId);
    if (contract === undefined) {
        response.json({
            success: false,
            errorMessage: 'Contract not found.'
        });
        return;
    }
    try {
        const success = updateContractAttachment(contractAttachmentId, {
            attachmentDetails: request.body.attachmentDetails ?? '',
            attachmentTitle: request.body.attachmentTitle ?? ''
        }, request.session.user);
        if (!success) {
            response.json({
                success: false,
                errorMessage: 'Failed to update attachment.'
            });
            return;
        }
        const contractAttachments = getContractAttachments(contractId);
        response.json({
            success: true,
            contractAttachments
        });
    }
    catch (error) {
        response.json({
            success: false,
            errorMessage: error.message
        });
    }
}
