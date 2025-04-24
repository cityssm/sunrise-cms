import { deleteRecord } from '../../database/deleteRecord.js';
import getContractComments from '../../database/getContractComments.js';
export default function handler(request, response) {
    const success = deleteRecord('ContractComments', request.body.contractCommentId, request.session.user);
    const contractComments = getContractComments(request.body.contractId);
    response.json({
        success,
        contractComments
    });
}
