import addFuneralHome from '../../database/addFuneralHome.js';
export default async function handler(request, response) {
    const funeralHomeId = await addFuneralHome(request.body, request.session.user);
    response.json({
        success: true,
        funeralHomeId
    });
}
