import { getLotOccupantTypes } from '../../helpers/functions.cache.js';
import { deleteRecord } from '../../helpers/lotOccupancyDB/deleteRecord.js';
export async function handler(request, response) {
    const success = await deleteRecord('LotOccupantTypes', request.body.lotOccupantTypeId, request.session.user);
    const lotOccupantTypes = await getLotOccupantTypes();
    response.json({
        success,
        lotOccupantTypes
    });
}
export default handler;
