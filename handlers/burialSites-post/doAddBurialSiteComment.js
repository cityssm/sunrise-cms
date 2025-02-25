import addBurialSiteComment from '../../database/addBurialSiteComment.js';
import getBurialSiteComments from '../../database/getBurialSiteComments.js';
export default async function handler(request, response) {
    await addBurialSiteComment(request.body, request.session.user);
    const burialSiteComments = await getBurialSiteComments(request.body.burialSiteId);
    response.json({
        success: true,
        burialSiteComments
    });
}
