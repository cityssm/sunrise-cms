import { restoreFuneralHome } from '../../database/restoreFuneralHome.js';
export default function handler(request, response) {
    const success = restoreFuneralHome(request.body.funeralHomeId, request.session.user);
    const funeralHomeId = typeof request.body.funeralHomeId === 'string'
        ? Number.parseInt(request.body.funeralHomeId, 10)
        : request.body.funeralHomeId;
    response.json({
        success,
        funeralHomeId
    });
}
