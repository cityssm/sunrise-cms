import getBurialSiteNamesByRange, { burialSiteNameRangeLimit } from '../../database/getBurialSiteNamesByRange.js';
export default function handler(request, response) {
    const burialSiteNames = getBurialSiteNamesByRange(request.body);
    response.json({
        burialSiteNames,
        cemeteryId: request.body.cemeteryId,
        burialSiteNameRangeLimit
    });
}
