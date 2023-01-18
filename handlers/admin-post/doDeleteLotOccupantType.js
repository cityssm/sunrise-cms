import { deleteRecord } from '../../helpers/lotOccupancyDB/deleteRecord.js';
import { getLotOccupantTypes } from '../../helpers/functions.cache.js';
export async function handler(request, response) {
    const success = await deleteRecord('LotOccupantTypes', request.body.lotOccupantTypeId, request.session);
    const lotOccupantTypes = await getLotOccupantTypes();
    response.json({
        success,
        lotOccupantTypes
    });
}
export default handler;
