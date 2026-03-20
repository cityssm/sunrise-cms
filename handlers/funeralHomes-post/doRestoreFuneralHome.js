import { restoreFuneralHome } from '../../database/restoreFuneralHome.js';
export default function handler(request, response) {
    const success = restoreFuneralHome(request.body.funeralHomeId, request.session.user);
    if (!success) {
        response.status(400).json({
            errorMessage: 'Failed to restore funeral home',
            success: false
        });
        return;
    }
    const funeralHomeId = typeof request.body.funeralHomeId === 'string'
        ? Number.parseInt(request.body.funeralHomeId, 10)
        : request.body.funeralHomeId;
    response.json({
        success,
        funeralHomeId
    });
}
