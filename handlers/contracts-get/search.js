import getCemeteries from '../../database/getCemeteries.js';
import getFuneralHomes from '../../database/getFuneralHomes.js';
import { getCachedBurialSiteTypes } from '../../helpers/cache/burialSiteTypes.cache.js';
import { getCachedContractTypes } from '../../helpers/cache/contractTypes.cache.js';
export default function handler(request, response) {
    const cemeteries = getCemeteries();
    const burialSiteTypes = getCachedBurialSiteTypes();
    const contractTypes = getCachedContractTypes();
    const funeralHomes = getFuneralHomes();
    response.render('contract-search', {
        headTitle: 'Contract Search',
        burialSiteTypes,
        cemeteries,
        cemeteryId: request.query.cemeteryId,
        contractTypes,
        funeralHomes
    });
}
