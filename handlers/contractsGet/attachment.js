import path from 'node:path';
import process from 'node:process';
import getContractAttachment from '../../database/getContractAttachment.js';
export default function handler(request, response) {
    const contractAttachment = getContractAttachment(request.params.attachmentId);
    if (contractAttachment === undefined) {
        response.status(404).send();
        return;
    }
    response.sendFile(path.join(contractAttachment.filePath ?? '', contractAttachment.fileName), {
        headers: {
            'Content-Disposition': `attachment; filename="${contractAttachment.fileName}"`
        },
        root: process.cwd()
    });
}
