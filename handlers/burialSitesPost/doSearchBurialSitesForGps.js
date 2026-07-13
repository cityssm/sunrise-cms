import getBurialSiteDeceasedNames from '../../database/getBurialSiteDeceasedNames.js';
import getBurialSites from '../../database/getBurialSites.js';
export default function handler(request, response) {
    const filters = request.body;
    if ((filters.cemeteryId ?? '') === '') {
        response.json({
            errorMessage: 'Cemetery selection is required',
            success: false
        });
        return;
    }
    const result = getBurialSites(request.body, {
        limit: 500,
        offset: 0,
        includeContractCount: false
    });
    const burialSites = result.burialSites;
    const burialSiteInterments = getBurialSiteDeceasedNames(burialSites.map((site) => site.burialSiteId));
    const burialSitesWithDeceasedNames = burialSites.map((site) => ({
        ...site,
        deceasedNames: burialSiteInterments.find((bi) => bi.burialSiteId === site.burialSiteId)
            ?.deceasedNames ?? []
    }));
    response.json({
        burialSites: burialSitesWithDeceasedNames,
        success: true
    });
}
