import { getConfigProperty } from '../../helpers/config.helpers.js';
export default function handler(_request, response) {
    const funeralHome = {
        funeralHomeCity: getConfigProperty('settings.cityDefault'),
        funeralHomeProvince: getConfigProperty('settings.provinceDefault')
    };
    response.render('funeralHome-edit', {
        headTitle: `Create a Funeral Home`,
        isCreate: true,
        funeralHome
    });
}
