import getBurialSiteComments from '../../database/getBurialSiteComments.js';
import updateBurialSiteComment from '../../database/updateBurialSiteComment.js';
export default async function handler(request, response) {
    const success = await updateBurialSiteComment(request.body, request.session.user);
    const burialSiteComments = await getBurialSiteComments(request.body.burialSiteId);
    response.json({
        success,
        burialSiteComments
    });
}
