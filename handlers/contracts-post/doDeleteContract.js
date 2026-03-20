import { deleteContract } from '../../database/deleteContract.js';
export default function handler(request, response) {
    const success = deleteContract(request.body.contractId, request.session.user);
    if (!success) {
        response.status(400).json({
            success: false,
            errorMessage: 'Note that contracts with active work orders cannot be deleted.'
        });
        return;
    }
    response.json({
        success
    });
}
