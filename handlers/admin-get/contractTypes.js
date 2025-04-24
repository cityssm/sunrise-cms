import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getAllContractTypeFields, getContractTypes } from '../../helpers/functions.cache.js';
import { getPrintConfig } from '../../helpers/functions.print.js';
export default function handler(_request, response) {
    const contractTypes = getContractTypes();
    const allContractTypeFields = getAllContractTypeFields();
    const contractTypePrints = getConfigProperty('settings.contracts.prints');
    const contractTypePrintTitles = {};
    for (const printEJS of contractTypePrints) {
        const printConfig = getPrintConfig(printEJS);
        if (printConfig !== undefined) {
            contractTypePrintTitles[printEJS] = printConfig.title;
        }
    }
    response.render('admin-contractTypes', {
        headTitle: 'Contract Type Management',
        allContractTypeFields,
        contractTypePrintTitles,
        contractTypes
    });
}
