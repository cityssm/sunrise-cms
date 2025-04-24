import getContractComments from '../../database/getContractComments.js';
import updateContractComment from '../../database/updateContractComment.js';
export default function handler(request, response) {
    const success = updateContractComment(request.body, request.session.user);
    const contractComments = getContractComments(request.body.contractId);
    response.json({
        success,
        contractComments
    });
}
