import { deleteRecord } from '../../database/deleteRecord.js';
import getFeeCategories from '../../database/getFeeCategories.js';
export default function handler(request, response) {
    const success = deleteRecord('FeeCategories', request.body.feeCategoryId, request.session.user);
    const feeCategories = getFeeCategories({}, {
        includeFees: true
    });
    response.json({
        success,
        feeCategories
    });
}
