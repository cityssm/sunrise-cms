import { getAllCachedContractTypeFields, getCachedContractTypes } from '../../helpers/cache/contractTypes.cache.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getPrintConfig } from '../../helpers/print.helpers.js';
import { i18next } from '../../helpers/i18n.helpers.js';
export default function handler(_request, response) {
    const contractTypes = getCachedContractTypes();
    const allContractTypeFields = getAllCachedContractTypeFields();
    const contractTypePrints = getConfigProperty('settings.contracts.prints');
    const contractTypePrintTitles = {};
    for (const printEJS of contractTypePrints) {
        const printConfig = getPrintConfig(printEJS);
        if (printConfig !== undefined) {
            // eslint-disable-next-line security/detect-object-injection
            contractTypePrintTitles[printEJS] = printConfig.title;
        }
    }
    response.render('admin/contractTypes', {
        headTitle: i18next.t('admin:contractTypeManagement', { lng: response.locals.lng }),
        allContractTypeFields,
        contractTypePrintTitles,
        contractTypes
    });
}
