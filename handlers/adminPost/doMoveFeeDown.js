import getFeeCategories from '../../database/getFeeCategories.js';
import { moveFeeDown, moveFeeDownToBottom } from '../../database/moveFee.js';
export default function handler(request, response) {
    const success = request.body.moveToEnd === '1'
        ? moveFeeDownToBottom(request.body.feeId)
        : moveFeeDown(request.body.feeId);
    const feeCategories = getFeeCategories({}, {
        includeFees: true
    });
    response.json({
        success,
        feeCategories
    });
}
