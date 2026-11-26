import { getDynamicsGpDocument } from '../../integrations/dynamicsGp/helpers.js';
export default async function handler(request, response) {
    const { externalReceiptNumber } = request.body;
    const dynamicsGpDocument = await getDynamicsGpDocument(externalReceiptNumber);
    if (dynamicsGpDocument === undefined) {
        response.json({
            success: false
        });
    }
    else {
        response.json({
            success: true,
            dynamicsGpDocument
        });
    }
}
