import { getCachedSettings } from '../../helpers/cache/settings.cache.js';
export default function handler(_request, response) {
    const settings = getCachedSettings();
    response.render('admin-settings', {
        headTitle: 'Settings Management',
        settings
    });
}
