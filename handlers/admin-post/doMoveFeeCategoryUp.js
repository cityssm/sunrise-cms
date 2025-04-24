import getFeeCategories from '../../database/getFeeCategories.js';
import { moveRecordUp, moveRecordUpToTop } from '../../database/moveRecord.js';
export default function handler(request, response) {
    const success = request.body.moveToEnd === '1'
        ? moveRecordUpToTop('FeeCategories', request.body.feeCategoryId)
        : moveRecordUp('FeeCategories', request.body.feeCategoryId);
    const feeCategories = getFeeCategories({}, {
        includeFees: true
    });
    response.json({
        success,
        feeCategories
    });
}
