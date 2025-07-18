import { getBurialSiteTypeById } from '../../helpers/cache.helpers.js';
export default function handler(request, response) {
    const burialSiteType = getBurialSiteTypeById(Number.parseInt(request.body.burialSiteTypeId, 10));
    response.json({
        burialSiteTypeFields: burialSiteType?.burialSiteTypeFields ?? []
    });
}
