import { deleteRecord } from '../../database/deleteRecord.js';
import getFeeCategories from '../../database/getFeeCategories.js';
export default function handler(request, response) {
    const success = deleteRecord('Fees', request.body.feeId, request.session.user);
    const feeCategories = getFeeCategories({}, {
        includeFees: true
    });
    response.json({
        success,
        feeCategories
    });
}
