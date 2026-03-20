import updateFuneralHome from '../../database/updateFuneralHome.js';
export default function handler(request, response) {
    const success = updateFuneralHome(request.body, request.session.user);
    if (!success) {
        response.status(400).json({
            errorMessage: 'Failed to update funeral home',
            success: false
        });
        return;
    }
    response.json({
        success,
        funeralHomeId: request.body.funeralHomeId
    });
}
