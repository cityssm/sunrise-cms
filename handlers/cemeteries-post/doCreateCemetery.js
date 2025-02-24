import addCemetery from '../../database/addCemetery.js';
export default async function handler(request, response) {
    const cemeteryId = await addCemetery(request.body, request.session.user);
    response.json({
        success: true,
        cemeteryId
    });
}
