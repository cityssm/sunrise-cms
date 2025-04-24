import updateFuneralHome from '../../database/updateFuneralHome.js';
export default function handler(request, response) {
    const success = updateFuneralHome(request.body, request.session.user);
    response.json({
        success,
        funeralHomeId: request.body.funeralHomeId
    });
}
