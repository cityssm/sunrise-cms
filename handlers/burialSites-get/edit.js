import getLot from '../../database/getLot.js';
import getMaps from '../../database/getMaps.js';
import { getLotStatuses, getBurialSiteTypes } from '../../helpers/functions.cache.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
export default async function handler(request, response) {
    const lot = await getLot(request.params.lotId);
    if (lot === undefined) {
        response.redirect(`${getConfigProperty('reverseProxy.urlPrefix')}/lots/?error=lotIdNotFound`);
        return;
    }
    const maps = await getMaps();
    const lotTypes = await getBurialSiteTypes();
    const lotStatuses = await getLotStatuses();
    response.render('lot-edit', {
        headTitle: lot.lotName,
        lot,
        isCreate: false,
        maps,
        lotTypes,
        lotStatuses
    });
}
