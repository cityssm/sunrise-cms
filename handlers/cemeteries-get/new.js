import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getMapSVGs } from '../../helpers/functions.map.js';
export default async function handler(_request, response) {
    const map = {
        mapCity: getConfigProperty('settings.map.mapCityDefault'),
        mapProvince: getConfigProperty('settings.map.mapProvinceDefault')
    };
    const mapSVGs = await getMapSVGs();
    response.render('map-edit', {
        headTitle: `${getConfigProperty('aliases.map')} Create`,
        isCreate: true,
        map,
        mapSVGs
    });
}
