import addBurialSiteTypeField from '../../database/addBurialSiteTypeField.js';
import { getBurialSiteTypes } from '../../helpers/functions.cache.js';
export default async function handler(request, response) {
    const burialSiteTypeFieldId = await addBurialSiteTypeField(request.body, request.session.user);
    const burialSiteTypes = await getBurialSiteTypes();
    response.json({
        success: true,
        burialSiteTypeFieldId,
        burialSiteTypes
    });
}
