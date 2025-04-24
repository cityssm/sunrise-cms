import addFuneralHome from '../../database/addFuneralHome.js';
export default function handler(request, response) {
    const funeralHomeId = addFuneralHome(request.body, request.session.user);
    response.json({
        success: true,
        funeralHomeId
    });
}
