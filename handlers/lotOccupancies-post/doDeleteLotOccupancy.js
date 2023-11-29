import { deleteRecord } from '../../database/deleteRecord.js';
export async function handler(request, response) {
    const success = await deleteRecord('LotOccupancies', request.body.lotOccupancyId, request.session.user);
    response.json({
        success
    });
}
export default handler;
