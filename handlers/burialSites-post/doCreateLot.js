import addLot from '../../database/addLot.js';
import { clearNextPreviousLotIdCache } from '../../helpers/functions.lots.js';
export default async function handler(request, response) {
    const lotId = await addLot(request.body, request.session.user);
    response.json({
        success: true,
        lotId
    });
    response.on('finish', () => {
        clearNextPreviousLotIdCache(-1);
    });
}
