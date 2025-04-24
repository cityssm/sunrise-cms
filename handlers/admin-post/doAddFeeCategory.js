import addFeeCategory from '../../database/addFeeCategory.js';
import getFeeCategories from '../../database/getFeeCategories.js';
export default function handler(request, response) {
    const feeCategoryId = addFeeCategory(request.body, request.session.user);
    const feeCategories = getFeeCategories({}, {
        includeFees: true
    });
    response.json({
        success: true,
        feeCategories,
        feeCategoryId
    });
}
