import { deleteRecord } from '../../database/deleteRecord.js';
import getBurialSiteComments from '../../database/getBurialSiteComments.js';
export default function handler(request, response) {
    const success = deleteRecord('BurialSiteComments', request.body.burialSiteCommentId, request.session.user);
    const burialSiteComments = getBurialSiteComments(request.body.burialSiteId);
    response.json({
        success,
        burialSiteComments
    });
}
