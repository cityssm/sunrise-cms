import getBurialSiteComments from '../../database/getBurialSiteComments.js';
import updateBurialSiteComment from '../../database/updateBurialSiteComment.js';
export default function handler(request, response) {
    const success = updateBurialSiteComment(request.body, request.session.user);
    const burialSiteComments = getBurialSiteComments(request.body.burialSiteId);
    response.json({
        success,
        burialSiteComments
    });
}
