import getContractComments from '../../database/getContractComments.js';
import updateContractComment from '../../database/updateContractComment.js';
export default async function handler(request, response) {
    const success = await updateContractComment(request.body, request.session.user);
    const contractComments = await getContractComments(request.body.contractId);
    response.json({
        success,
        contractComments
    });
}
