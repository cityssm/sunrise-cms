import addMap from '../../database/addMap.js';
export default async function handler(request, response) {
    const mapId = await addMap(request.body, request.session.user);
    response.json({
        success: true,
        mapId
    });
}
