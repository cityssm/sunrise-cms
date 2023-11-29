import { getFeeCategories } from '../../helpers/lotOccupancyDB/getFeeCategories.js';
import { updateFeeCategory } from '../../helpers/lotOccupancyDB/updateFeeCategory.js';
export async function handler(request, response) {
    const success = await updateFeeCategory(request.body, request.session.user);
    const feeCategories = await getFeeCategories({}, {
        includeFees: true
    });
    response.json({
        success,
        feeCategories
    });
}
export default handler;
