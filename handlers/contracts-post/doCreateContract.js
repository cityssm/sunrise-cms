import addContract from '../../database/addContract.js';
export default async function handler(request, response) {
    const contractId = await addContract(request.body, request.session.user);
    response.json({
        success: true,
        contractId
    });
}
