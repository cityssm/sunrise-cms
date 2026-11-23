import getBurialSites from '../../database/getBurialSites.js';
import { getCachedSettingValue } from '../../helpers/cache/settings.cache.js';
export default function handler(request, response) {
    const result = getBurialSites(request.body, {
        limit: request.body.limit,
        offset: request.body.offset,
        includeContractCount: true
    });
    const bodyCapacityDefault = Number(getCachedSettingValue('burialSiteTypes.bodyCapacityMaxDefault'));
    const crematedCapacityDefault = Number(getCachedSettingValue('burialSiteTypes.crematedCapacityMaxDefault'));
    for (const burialSite of result.burialSites) {
        burialSite.setBodyCapacity =
            burialSite.bodyCapacity ??
                burialSite.bodyCapacityMax ??
                (Number.isFinite(bodyCapacityDefault) ? bodyCapacityDefault : null);
        burialSite.setCrematedCapacity =
            burialSite.crematedCapacity ??
                burialSite.crematedCapacityMax ??
                (Number.isFinite(crematedCapacityDefault)
                    ? crematedCapacityDefault
                    : null);
    }
    response.json({
        burialSites: result.burialSites,
        count: result.count,
        offset: typeof request.body.offset === 'string'
            ? Math.trunc(Number(request.body.offset))
            : request.body.offset
    });
}
