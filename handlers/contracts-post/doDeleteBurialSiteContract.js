import { deleteRecord } from '../../database/deleteRecord.js';
export default async function handler(request, response) {
    const success = await deleteRecord('BurialSiteContracts', request.body.burialSiteContractId, request.session.user);
    response.json({
        success
    });
}
