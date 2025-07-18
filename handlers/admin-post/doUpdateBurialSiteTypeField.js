import updateBurialSiteTypeField from '../../database/updateBurialSiteTypeField.js';
import { getBurialSiteTypes } from '../../helpers/cache.helpers.js';
export default function handler(request, response) {
    const success = updateBurialSiteTypeField(request.body, request.session.user);
    const burialSiteTypes = getBurialSiteTypes();
    response.json({
        success,
        burialSiteTypes
    });
}
