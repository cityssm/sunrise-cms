import getFuneralHome from '../../database/getFuneralHome.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
export default async function handler(request, response) {
    const funeralHome = await getFuneralHome(request.params.funeralHomeId);
    if (funeralHome === undefined) {
        response.redirect(`${getConfigProperty('reverseProxy.urlPrefix')}/funeralHomes/?error=funeralHomeIdNotFound`);
        return;
    }
    response.render('funeralHome-edit', {
        headTitle: funeralHome.funeralHomeName,
        isCreate: false,
        funeralHome
    });
}
