import { deleteRecord } from '../../database/deleteRecord.js';
export default function handler(request, response) {
    const success = deleteRecord('FuneralHomes', request.body.funeralHomeId, request.session.user);
    response.json({
        success
    });
}
