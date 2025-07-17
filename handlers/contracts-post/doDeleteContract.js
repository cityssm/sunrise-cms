import { deleteContract } from '../../database/deleteContract.js';
export default function handler(request, response) {
    const success = deleteContract(request.body.contractId, request.session.user);
    response.json({
        success,
        errorMessage: success
            ? ''
            : 'Note that contracts with active work orders cannot be deleted.'
    });
}
