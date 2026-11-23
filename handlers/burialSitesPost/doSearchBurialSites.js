import getBurialSites from '../../database/getBurialSites.js';
export default function handler(request, response) {
    const result = getBurialSites(request.body, {
        limit: request.body.limit,
        offset: request.body.offset,
        includeContractCount: true
    });
    for (const burialSite of result.burialSites) {
        burialSite.setBodyCapacity =
            burialSite.bodyCapacity ?? burialSite.bodyCapacityMax ?? undefined;
        burialSite.setCrematedCapacity =
            burialSite.crematedCapacity ?? burialSite.crematedCapacityMax ?? undefined;
    }
    response.json({
        burialSites: result.burialSites,
        count: result.count,
        offset: typeof request.body.offset === 'string'
            ? Math.trunc(Number(request.body.offset))
            : request.body.offset
    });
}
