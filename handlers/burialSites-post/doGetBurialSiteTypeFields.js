import { getBurialSiteTypeById } from '../../helpers/functions.cache.js';
export default function handler(request, response) {
    const burialSiteType = getBurialSiteTypeById(Number.parseInt(request.body.burialSiteTypeId, 10));
    response.json({
        burialSiteTypeFields: burialSiteType?.burialSiteTypeFields ?? []
    });
}
