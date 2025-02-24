import updateCemetery from '../../database/updateCemetery.js';
export default async function handler(request, response) {
    const success = await updateCemetery(request.body, request.session.user);
    response.json({
        success,
        cemeteryId: request.body.cemeteryId
    });
}
