import PdfPuppeteer from '@cityssm/pdf-puppeteer';
import { renderFile as renderEjsFile } from 'ejs';
import exitHook from 'exit-hook';
import { getReportData } from './print.helpers.js';
const pdfPuppeteer = new PdfPuppeteer();
exitHook(() => {
    void pdfPuppeteer.closeBrowser();
});
export async function generatePdf(printConfig, parameters) {
    const reportData = await getReportData(printConfig, parameters);
    try {
        const renderedHtml = await renderEjsFile(printConfig.path, reportData);
        const pdf = await pdfPuppeteer.fromHtml(renderedHtml);
        return pdf;
    }
    catch (error) {
        throw new Error(`Error generating PDF for ${printConfig.title}: ${error.message}`);
    }
}
