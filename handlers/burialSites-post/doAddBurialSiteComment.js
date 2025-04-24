import addBurialSiteComment from '../../database/addBurialSiteComment.js';
import getBurialSiteComments from '../../database/getBurialSiteComments.js';
export default function handler(request, response) {
    addBurialSiteComment(request.body, request.session.user);
    const burialSiteComments = getBurialSiteComments(request.body.burialSiteId);
    response.json({
        success: true,
        burialSiteComments
    });
}
