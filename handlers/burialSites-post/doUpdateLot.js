import updateLot from '../../database/updateLot.js';
import { clearNextPreviousLotIdCache } from '../../helpers/functions.lots.js';
export default async function handler(request, response) {
    const lotId = Number.parseInt(request.body.lotId, 10);
    const success = await updateLot(request.body, request.session.user);
    response.json({
        success,
        lotId: request.body.lotId
    });
    response.on('finish', () => {
        clearNextPreviousLotIdCache(lotId);
    });
}
