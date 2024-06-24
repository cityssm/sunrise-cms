import { getConfigProperty } from '../../helpers/functions.config.js';
import { getReportData, getScreenPrintConfig } from '../../helpers/functions.print.js';
export default async function handler(request, response) {
    const printName = request.params.printName;
    if (!getConfigProperty('settings.lotOccupancy.prints').includes(`screen/${printName}`) &&
        !getConfigProperty('settings.workOrders.prints').includes(`screen/${printName}`)) {
        response.redirect(`${getConfigProperty('reverseProxy.urlPrefix')}/dashboard/?error=printConfigNotAllowed`);
        return;
    }
    const printConfig = getScreenPrintConfig(printName);
    if (printConfig === undefined) {
        response.redirect(`${getConfigProperty('reverseProxy.urlPrefix')}/dashboard/?error=printConfigNotFound`);
        return;
    }
    const reportData = await getReportData(printConfig, request.query);
    response.render(`print/screen/${printName}`, reportData);
}
