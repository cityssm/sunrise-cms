import { getConfigProperty } from '../../helpers/config.helpers.js';
export default function handler(_request, response) {
    const funeralHome = {
        funeralHomeName: '',
        funeralHomeAddress1: '',
        funeralHomeAddress2: '',
        funeralHomeCity: getConfigProperty('settings.cityDefault'),
        funeralHomePostalCode: '',
        funeralHomeProvince: getConfigProperty('settings.provinceDefault'),
        funeralHomePhoneNumber: ''
    };
    response.render('funeralHome-edit', {
        headTitle: 'Create a Funeral Home',
        funeralHome,
        isCreate: true
    });
}
