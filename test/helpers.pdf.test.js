import assert from 'node:assert';
import { after, describe, it } from 'node:test';
import isPdf from '@cityssm/is-pdf';
import getWorkOrders from '../database/getWorkOrders.js';
import { getConfigProperty } from '../helpers/config.helpers.js';
import { closePdfPuppeteer, generatePdf } from '../helpers/pdf.helpers.js';
import { getPrintConfig } from '../helpers/print.helpers.js';
await describe('helpers.pdf', async () => {
    after(() => {
        void closePdfPuppeteer();
    });
    await it('should generate a work order pdf', async () => {
        // Get any work order
        const workOrders = await getWorkOrders({}, {
            limit: 1,
            offset: 0
        });
        assert.ok(workOrders.count > 0, 'Expected at least one work order');
        const workOrderId = workOrders.workOrders[0].workOrderId;
        // Get the first work order print configuration
        const workOrderPrints = getConfigProperty('settings.workOrders.prints');
        assert.ok(workOrderPrints.length > 0, 'Expected at least one work order print configuration');
        let pdfPrintConfig;
        for (const printName of workOrderPrints) {
            const printConfig = getPrintConfig(printName);
            if (printConfig !== undefined && Object.hasOwn(printConfig, 'path')) {
                pdfPrintConfig = printConfig;
                break;
            }
        }
        assert.ok(pdfPrintConfig !== undefined, 'Expected a valid PDF print configuration');
        // Generate the PDF
        const pdf = await generatePdf(pdfPrintConfig, { workOrderId });
        assert.ok(isPdf(pdf), 'Expected a PDF to be generated');
    });
});
