import { moveLotTypeFieldUp, moveLotTypeFieldUpToTop } from '../../database/moveLotTypeField.js';
import { getBurialSiteTypes } from '../../helpers/functions.cache.js';
export default async function handler(request, response) {
    const success = request.body.moveToEnd === '1'
        ? await moveLotTypeFieldUpToTop(request.body.lotTypeFieldId)
        : await moveLotTypeFieldUp(request.body.lotTypeFieldId);
    const lotTypes = await getBurialSiteTypes();
    response.json({
        success,
        lotTypes
    });
}
