import addContractComment from '../../database/addContractComment.js';
import getContractComments from '../../database/getContractComments.js';
export default function handler(request, response) {
    addContractComment(request.body, request.session.user);
    const contractComments = getContractComments(request.body.contractId);
    response.json({
        success: true,
        contractComments
    });
}
