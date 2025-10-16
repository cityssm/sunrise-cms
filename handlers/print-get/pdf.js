import camelcase from 'camelcase';
import { getConfigProperty } from '../../helpers/config.helpers.js';
import { generatePdf } from '../../helpers/pdf.helpers.js';
import { getPdfPrintConfig } from '../../helpers/print.helpers.js';
const attachmentOrInline = getConfigProperty('settings.printPdf.contentDisposition');
export async function handler(request, response) {
    const printName = request.params.printName;
    if (!getConfigProperty('settings.contracts.prints').includes(`pdf/${printName}`) &&
        !getConfigProperty('settings.workOrders.prints').includes(`pdf/${printName}`)) {
        response.redirect(`${getConfigProperty('reverseProxy.urlPrefix')}/dashboard/?error=printConfigNotAllowed`);
        return;
    }
    const printConfig = getPdfPrintConfig(printName);
    if (printConfig === undefined) {
        response.redirect(`${getConfigProperty('reverseProxy.urlPrefix')}/dashboard/?error=printConfigNotFound`);
        return;
    }
    const pdfData = await generatePdf(printConfig, request.query);
    let exportFileNameId = '';
    if (printConfig.params.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-base-to-string, @typescript-eslint/restrict-template-expressions
        exportFileNameId = `-${request.query[printConfig.params[0] ?? '']}`;
    }
    const exportFileName = `${camelcase(printConfig.title)}${exportFileNameId}.pdf`;
    response.setHeader('Content-Disposition', `${attachmentOrInline}; filename=${exportFileName}`);
    response.setHeader('Content-Type', 'application/pdf');
    response.send(pdfData);
}
export default handler;
