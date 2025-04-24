import getFeeCategories from '../../database/getFeeCategories.js';
import updateFeeCategory from '../../database/updateFeeCategory.js';
export default function handler(request, response) {
    const success = updateFeeCategory(request.body, request.session.user);
    const feeCategories = getFeeCategories({}, {
        includeFees: true
    });
    response.json({
        success,
        feeCategories
    });
}
