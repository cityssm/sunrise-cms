import addContractAttachment from '../../database/addContractAttachment.js';
import getContract from '../../database/getContract.js';
import getContractAttachments from '../../database/getContractAttachments.js';
import { writeAttachment } from '../../helpers/attachments.helpers.js';
export default async function handler(request, response) {
    const file = request.file;
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (file === undefined) {
        response.json({
            success: false,
            errorMessage: 'No file uploaded.'
        });
        return;
    }
    const contractId = Number.parseInt(request.body.contractId, 10);
    // Verify contract exists
    const contract = await getContract(contractId);
    if (contract === undefined) {
        response.json({
            success: false,
            errorMessage: 'Contract not found.'
        });
        return;
    }
    try {
        // Write file to disk
        const { fileName, filePath } = await writeAttachment(file.originalname, file.buffer);
        // Add attachment record to database
        const attachmentId = addContractAttachment({
            contractId,
            attachmentDetails: request.body.attachmentDetails ?? '',
            attachmentTitle: request.body.attachmentTitle ?? file.originalname,
            fileName,
            filePath
        }, request.session.user);
        const contractAttachments = getContractAttachments(contractId);
        response.json({
            success: true,
            attachmentId,
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
