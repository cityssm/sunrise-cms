import PdfPuppeteer, { installChromeBrowser, installFirefoxBrowser } from '@cityssm/pdf-puppeteer';
import Debug from 'debug';
import { renderFile as renderEjsFile } from 'ejs';
import exitHook from 'exit-hook';
import updateSetting from '../database/updateSetting.js';
import { DEBUG_NAMESPACE } from '../debug.config.js';
import { getCachedSettingValue } from './cache/settings.cache.js';
import { getReportData } from './print.helpers.js';
const debug = Debug(`${DEBUG_NAMESPACE}:helpers:pdf`);
const pdfPuppeteer = new PdfPuppeteer();
exitHook(() => {
    void pdfPuppeteer.closeBrowser();
});
export async function generatePdf(printConfig, parameters) {
    const reportData = await getReportData(printConfig, parameters);
    debug('Rendering:', printConfig.path);
    let renderedHtml = '';
    try {
        renderedHtml = await renderEjsFile(printConfig.path, reportData);
    }
    catch (error) {
        throw new Error(`Error rendering HTML for ${printConfig.title}: ${error.message}`);
    }
    try {
        const pdf = await pdfPuppeteer.fromHtml(renderedHtml);
        return pdf;
    }
    catch (error) {
        const browserInstallAttempted = getCachedSettingValue('pdfPuppeteer.browserInstallAttempted');
        if (browserInstallAttempted === 'false') {
            try {
                await installChromeBrowser();
                await installFirefoxBrowser();
            }
            catch (error) {
                debug('Error installing browsers:', error);
            }
            updateSetting({
                settingKey: 'pdfPuppeteer.browserInstallAttempted',
                settingValue: 'true'
            });
            await pdfPuppeteer.closeBrowser();
            debug('PDF Puppeteer browser installation was attempted.');
            return await generatePdf(printConfig, parameters);
        }
        throw new Error(`Error generating PDF for ${printConfig.title}: ${error.message}`);
    }
}
