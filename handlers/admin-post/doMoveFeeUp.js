import getFeeCategories from '../../database/getFeeCategories.js';
import { moveFeeUp, moveFeeUpToTop } from '../../database/moveFee.js';
export default function handler(request, response) {
    const success = request.body.moveToEnd === '1'
        ? moveFeeUpToTop(request.body.feeId)
        : moveFeeUp(request.body.feeId);
    const feeCategories = getFeeCategories({}, {
        includeFees: true
    });
    response.json({
        success,
        feeCategories
    });
}
