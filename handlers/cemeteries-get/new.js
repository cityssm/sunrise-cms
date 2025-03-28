import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getCemeterySVGs } from '../../helpers/images.helpers.js';
export default async function handler(_request, response) {
    const cemetery = {
        cemeteryCity: getConfigProperty('settings.cityDefault'),
        cemeteryProvince: getConfigProperty('settings.provinceDefault')
    };
    const cemeterySVGs = await getCemeterySVGs();
    response.render('cemetery-edit', {
        headTitle: "Create a Cemetery",
        cemetery,
        cemeterySVGs,
        isCreate: true,
    });
}
