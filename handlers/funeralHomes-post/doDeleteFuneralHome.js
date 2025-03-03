import { deleteRecord } from '../../database/deleteRecord.js';
export default async function handler(request, response) {
    const success = await deleteRecord('FuneralHomes', request.body.funeralHomeId, request.session.user);
    response.json({
        success
    });
}
