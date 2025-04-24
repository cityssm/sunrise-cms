import addContract from '../../database/addContract.js';
export default function handler(request, response) {
    const contractId = addContract(request.body, request.session.user);
    response.json({
        success: true,
        contractId
    });
}
