import addCemetery from '../../database/addCemetery.js';
export default function handler(request, response) {
    const cemeteryId = addCemetery(request.body, request.session.user);
    response.json({
        success: true,
        cemeteryId
    });
}
