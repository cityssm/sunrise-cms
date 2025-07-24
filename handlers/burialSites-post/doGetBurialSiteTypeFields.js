import { getCachedBurialSiteTypeById } from '../../helpers/cache/burialSiteTypes.cache.js';
export default function handler(request, response) {
    const burialSiteType = getCachedBurialSiteTypeById(Number.parseInt(request.body.burialSiteTypeId, 10));
    response.json({
        burialSiteTypeFields: burialSiteType?.burialSiteTypeFields ?? []
    });
}
