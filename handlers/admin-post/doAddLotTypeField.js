import addLotTypeField from '../../database/addLotTypeField.js';
import { getBurialSiteTypes } from '../../helpers/functions.cache.js';
export default async function handler(request, response) {
    const lotTypeFieldId = await addLotTypeField(request.body, request.session.user);
    const lotTypes = await getBurialSiteTypes();
    response.json({
        success: true,
        lotTypeFieldId,
        lotTypes
    });
}
