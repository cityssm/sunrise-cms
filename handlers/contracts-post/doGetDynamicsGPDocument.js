/* eslint-disable unicorn/filename-case */
import { getDynamicsGPDocument } from '../../integrations/dynamicsGp/helpers.js';
export default async function handler(request, response) {
    const externalReceiptNumber = request.body.externalReceiptNumber;
    const dynamicsGPDocument = await getDynamicsGPDocument(externalReceiptNumber);
    if (dynamicsGPDocument === undefined) {
        response.json({
            success: false
        });
    }
    else {
        response.json({
            success: true,
            dynamicsGPDocument
        });
    }
}
