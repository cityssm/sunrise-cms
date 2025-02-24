import { dateToString } from '@cityssm/utils-datetime';
import getMaps from '../../database/getMaps.js';
import { getLotStatuses, getBurialSiteTypes } from '../../helpers/functions.cache.js';
export default async function handler(_request, response) {
    const rightNow = new Date();
    const maps = await getMaps();
    const lotTypes = await getBurialSiteTypes();
    const lotStatuses = await getLotStatuses();
    response.render('report-search', {
        headTitle: 'Reports',
        todayDateString: dateToString(rightNow),
        maps,
        lotTypes,
        lotStatuses
    });
}
