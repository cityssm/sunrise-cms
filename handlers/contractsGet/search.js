import getFuneralHomes from '../../database/getFuneralHomes.js';
import { getUnprocessedOrderFormCount } from '../../database/getUnprocessedOrderForms.js';
import { getCachedBurialSiteTypes } from '../../helpers/cache/burialSiteTypes.cache.js';
import { getCachedCemeteries } from '../../helpers/cache/cemeteries.cache.js';
import { getCachedContractTypes } from '../../helpers/cache/contractTypes.cache.js';
import { getCachedServiceTypes } from '../../helpers/cache/serviceTypes.cache.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
import { i18next } from '../../helpers/i18n.helpers.js';
export default function handler(request, response) {
    let error = request.query.error;
    switch (error) {
        case 'contractIdNotFound': {
            error = 'Contract ID not found.';
            break;
        }
        case 'noNextContractIdFound': {
            error = 'No next Contract ID found.';
            break;
        }
        case 'noPreviousContractIdFound': {
            error = 'No previous Contract ID found.';
            break;
        }
    }
    const cemeteries = getCachedCemeteries();
    const burialSiteTypes = getCachedBurialSiteTypes();
    const contractTypes = getCachedContractTypes();
    const funeralHomes = getFuneralHomes(false);
    const serviceTypes = getCachedServiceTypes();
    const unprocessedOrderFormCount = getConfigProperty('integrations.portal.integrationIsEnabled')
        ? getUnprocessedOrderFormCount()
        : 0;
    response.render('contracts/search', {
        headTitle: i18next.t('contracts.contractSearch', {
            lng: response.locals.lng
        }),
        cemeteryId: request.query.cemeteryId,
        contractNumber: request.query.contractNumber ?? '',
        deceasedName: request.query.deceasedName ?? '',
        burialSiteTypes,
        cemeteries,
        contractTypes,
        funeralHomes,
        serviceTypes,
        unprocessedOrderFormCount,
        error
    });
}
