import { getCachedBurialSiteTypeById } from '../../helpers/cache/burialSiteTypes.cache.js';
export default function handler(request, response) {
    const burialSiteType = getCachedBurialSiteTypeById(Math.trunc(Number(request.body.burialSiteTypeId)));
    response.json({
        burialSiteTypeFields: burialSiteType?.burialSiteTypeFields ?? []
    });
}
