import addFee from '../../database/addFee.js';
import getFeeCategories from '../../database/getFeeCategories.js';
export default function handler(request, response) {
    const feeId = addFee(request.body, request.session.user);
    const feeCategories = getFeeCategories({}, {
        includeFees: true
    });
    response.json({
        success: true,
        feeCategories,
        feeId
    });
}
