import getCemeteries from '../../database/getCemeteries.js';
import getFuneralHomes from '../../database/getFuneralHomes.js';
import { getBurialSiteTypes, getContractTypes } from '../../helpers/functions.cache.js';
export default function handler(request, response) {
    const cemeteries = getCemeteries();
    const burialSiteTypes = getBurialSiteTypes();
    const contractTypes = getContractTypes();
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
