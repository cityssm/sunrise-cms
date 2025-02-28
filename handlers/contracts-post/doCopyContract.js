import copyContract from '../../database/copyContract.js';
export default async function handler(request, response) {
    const contractId = await copyContract(request.body.contractId, request.session.user);
    response.json({
        success: true,
        contractId
    });
}
