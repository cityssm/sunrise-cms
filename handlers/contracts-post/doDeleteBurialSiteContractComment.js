import { deleteRecord } from '../../database/deleteRecord.js';
import getBurialSiteContractComments from '../../database/getBurialSiteContractComments.js';
export default async function handler(request, response) {
    const success = await deleteRecord('BurialSiteContractComments', request.body.burialSiteContractCommentId, request.session.user);
    const burialSiteContractComments = await getBurialSiteContractComments(request.body.burialSiteContractId);
    response.json({
        success,
        burialSiteContractComments
    });
}
