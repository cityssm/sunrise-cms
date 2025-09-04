import getPreviousFuneralHomeId from '../../database/getPreviousFuneralHomeId.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
export default function handler(request, response) {
    const funeralHomeId = Number.parseInt(request.params.funeralHomeId, 10);
    const previousFuneralHomeId = getPreviousFuneralHomeId(funeralHomeId);
    if (previousFuneralHomeId === undefined) {
        response.redirect(`${getConfigProperty('reverseProxy.urlPrefix')}/funeralHomes/?error=noPreviousFuneralHomeIdFound`);
        return;
    }
    response.redirect(`${getConfigProperty('reverseProxy.urlPrefix')}/funeralHomes/${previousFuneralHomeId.toString()}`);
}
