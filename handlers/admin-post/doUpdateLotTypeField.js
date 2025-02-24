import updateBurialSiteTypeField from '../../database/updateBurialSiteTypeField.js';
import { getBurialSiteTypes } from '../../helpers/functions.cache.js';
export default async function handler(request, response) {
    const success = await updateBurialSiteTypeField(request.body, request.session.user);
    const lotTypes = await getBurialSiteTypes();
    response.json({
        success,
        lotTypes
    });
}
