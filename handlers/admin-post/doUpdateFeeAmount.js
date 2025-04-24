import getFeeCategories from '../../database/getFeeCategories.js';
import { updateFeeAmount } from '../../database/updateFee.js';
export default function handler(request, response) {
    const success = updateFeeAmount(request.body, request.session.user);
    const feeCategories = getFeeCategories({}, {
        includeFees: true
    });
    response.json({
        success,
        feeCategories
    });
}
