import updateMap from '../../database/updateMap.js';
export default async function handler(request, response) {
    const success = await updateMap(request.body, request.session.user);
    response.json({
        success,
        mapId: request.body.mapId
    });
}
