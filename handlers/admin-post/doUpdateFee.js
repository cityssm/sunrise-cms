import getFeeCategories from '../../database/getFeeCategories.js';
import updateFee from '../../database/updateFee.js';
export default function handler(request, response) {
    const success = updateFee(request.body, request.session.user);
    const feeCategories = getFeeCategories({}, {
        includeFees: true
    });
    response.json({
        success,
        feeCategories
    });
}
