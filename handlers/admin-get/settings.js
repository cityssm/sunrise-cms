import { getSettings } from '../../helpers/cache.helpers.js';
export default function handler(_request, response) {
    const settings = getSettings();
    response.render('admin-settings', {
        headTitle: 'Settings Management',
        settings
    });
}
