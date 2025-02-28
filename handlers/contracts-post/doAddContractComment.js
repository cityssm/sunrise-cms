import addContractComment from '../../database/addContractComment.js';
import getContractComments from '../../database/getContractComments.js';
export default async function handler(request, response) {
    await addContractComment(request.body, request.session.user);
    const contractComments = await getContractComments(request.body.contractId);
    response.json({
        success: true,
        contractComments
    });
}
