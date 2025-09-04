import getBurialSiteStatusSummary from '../../database/getBurialSiteStatusSummary.js';
import getBurialSiteTypeSummary from '../../database/getBurialSiteTypeSummary.js';
import getCemeteries from '../../database/getCemeteries.js';
import getCemetery from '../../database/getCemetery.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getCemeterySVGs } from '../../helpers/images.helpers.js';
export default async function handler(request, response) {
    const cemetery = getCemetery(request.params.cemeteryId);
    if (cemetery === undefined) {
        response.redirect(`${getConfigProperty('reverseProxy.urlPrefix')}/cemeteries/?error=cemeteryIdNotFound`);
        return;
    }
    const cemeteries = getCemeteries();
    const cemeterySVGs = await getCemeterySVGs();
    const burialSiteTypeSummary = getBurialSiteTypeSummary({
        cemeteryId: cemetery.cemeteryId
    });
    const burialSiteStatusSummary = getBurialSiteStatusSummary({
        cemeteryId: cemetery.cemeteryId
    });
    response.render('cemeteries/edit', {
        headTitle: cemetery.cemeteryName,
        cemetery,
        cemeterySVGs,
        isCreate: false,
        burialSiteStatusSummary,
        burialSiteTypeSummary,
        cemeteries
    });
}
