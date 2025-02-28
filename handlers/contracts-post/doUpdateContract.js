import updateContract from '../../database/updateContract.js';
export default async function handler(request, response) {
    const success = await updateContract(request.body, request.session.user);
    response.json({
        success,
        contractId: request.body.contractId
    });
}
