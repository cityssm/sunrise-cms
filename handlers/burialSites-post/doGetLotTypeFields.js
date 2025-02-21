import { getLotTypeById } from '../../helpers/functions.cache.js';
export default async function handler(request, response) {
    const lotType = (await getLotTypeById(Number.parseInt(request.body.lotTypeId, 10)));
    response.json({
        lotTypeFields: lotType.lotTypeFields
    });
}
