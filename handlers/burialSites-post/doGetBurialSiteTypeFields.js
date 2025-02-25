import { getBurialSiteTypeById } from '../../helpers/functions.cache.js';
export default async function handler(request, response) {
    const burialSiteType = await getBurialSiteTypeById(Number.parseInt(request.body.burialSiteTypeId, 10));
    response.json({
        burialSiteTypeFields: burialSiteType?.burialSiteTypeFields ?? []
    });
}
