import path from 'node:path';
import { convertHTMLToPDF } from '@cityssm/pdf-puppeteer';
import camelcase from 'camelcase';
import { renderFile as renderEjsFile } from 'ejs';
import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getPdfPrintConfig, getReportData } from '../../helpers/functions.print.js';
const attachmentOrInline = getConfigProperty('settings.printPdf.contentDisposition');
export async function handler(request, response, next) {
    const printName = request.params.printName;
    if (!getConfigProperty('settings.burialSiteContract.prints').includes(`pdf/${printName}`) &&
        !getConfigProperty('settings.workOrders.prints').includes(`pdf/${printName}`)) {
        response.redirect(`${getConfigProperty('reverseProxy.urlPrefix')}/dashboard/?error=printConfigNotAllowed`);
        return;
    }
    const printConfig = getPdfPrintConfig(printName);
    if (printConfig === undefined) {
        response.redirect(`${getConfigProperty('reverseProxy.urlPrefix')}/dashboard/?error=printConfigNotFound`);
        return;
    }
    const reportData = await getReportData(printConfig, request.query);
    const reportPath = path.join('views', 'print', 'pdf', `${printName}.ejs`);
    function pdfCallbackFunction(pdf) {
        response.setHeader('Content-Disposition', `${attachmentOrInline}; filename=${camelcase(printConfig?.title ?? 'export')}.pdf`);
        response.setHeader('Content-Type', 'application/pdf');
        response.send(pdf);
    }
    async function ejsCallbackFunction(ejsError, ejsData) {
        // eslint-disable-next-line unicorn/no-null
        if (ejsError != null) {
            next(ejsError);
            return;
        }
        const pdf = await convertHTMLToPDF(ejsData, {
            format: 'letter',
            printBackground: true,
            preferCSSPageSize: true
        });
        pdfCallbackFunction(Buffer.from(pdf));
    }
    await renderEjsFile(reportPath, reportData, {}, ejsCallbackFunction);
}
export default handler;
