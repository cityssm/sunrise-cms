import { deleteRecord } from '../../database/deleteRecord.js';
import getContractComments from '../../database/getContractComments.js';
export default async function handler(request, response) {
    const success = await deleteRecord('ContractComments', request.body.contractCommentId, request.session.user);
    const contractComments = await getContractComments(request.body.contractId);
    response.json({
        success,
        contractComments
    });
}
