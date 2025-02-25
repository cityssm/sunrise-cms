import { deleteRecord } from '../../database/deleteRecord.js';
import getBurialSiteComments from '../../database/getBurialSiteComments.js';
export default async function handler(request, response) {
    const success = await deleteRecord('BurialSiteComments', request.body.burialSiteCommentId, request.session.user);
    const burialSiteComments = await getBurialSiteComments(request.body.burialSiteId);
    response.json({
        success,
        burialSiteComments
    });
}
