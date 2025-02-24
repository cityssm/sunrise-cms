import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getAllContractTypeFields, getContractTypes } from '../../helpers/functions.cache.js';
import { getPrintConfig } from '../../helpers/functions.print.js';
export default async function handler(_request, response) {
    const contractTypes = await getContractTypes();
    const allContractTypeFields = await getAllContractTypeFields();
    const contractTypePrints = getConfigProperty('settings.contracts.prints');
    const occupancyTypePrintTitles = {};
    for (const printEJS of contractTypePrints) {
        const printConfig = getPrintConfig(printEJS);
        if (printConfig !== undefined) {
            occupancyTypePrintTitles[printEJS] = printConfig.title;
        }
    }
    response.render('admin-contractTypes', {
        headTitle: `Contract Type Management`,
        occupancyTypes: contractTypes,
        allContractTypeFields,
        occupancyTypePrintTitles
    });
}
