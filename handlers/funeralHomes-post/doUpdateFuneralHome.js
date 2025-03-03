import updateFuneralHome from '../../database/updateFuneralHome.js';
export default async function handler(request, response) {
    const success = await updateFuneralHome(request.body, request.session.user);
    response.json({
        success,
        funeralHomeId: request.body.funeralHomeId
    });
}
