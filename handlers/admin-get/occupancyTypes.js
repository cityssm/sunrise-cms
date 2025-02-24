import { getAllContractTypeFields, getContractTypes } from '../../helpers/functions.cache.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getPrintConfig } from '../../helpers/functions.print.js';
export default async function handler(_request, response) {
    const occupancyTypes = await getContractTypes();
    const allContractTypeFields = await getAllContractTypeFields();
    const ContractTypePrints = getConfigProperty('settings.lotOccupancy.prints');
    const occupancyTypePrintTitles = {};
    for (const printEJS of ContractTypePrints) {
        const printConfig = getPrintConfig(printEJS);
        if (printConfig !== undefined) {
            occupancyTypePrintTitles[printEJS] = printConfig.title;
        }
    }
    response.render('admin-occupancyTypes', {
        headTitle: `${getConfigProperty('aliases.occupancy')} Type Management`,
        occupancyTypes,
        allContractTypeFields,
        occupancyTypePrintTitles
    });
}
