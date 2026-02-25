import getFuneralHomes from '../../database/getFuneralHomes.js';
import { i18next } from '../../helpers/i18n.helpers.js';
export default function handler(request, response) {
    let error = request.query.error;
    switch (error) {
        case 'funeralHomeIdNotFound': {
            error = 'Funeral Home ID not found.';
            break;
        }
        case 'noNextFuneralHomeIdFound': {
            error = 'No next Funeral Home ID found.';
            break;
        }
        case 'noPreviousFuneralHomeIdFound': {
            error = 'No previous Funeral Home ID found.';
            break;
        }
        // No default
    }
    const funeralHomes = getFuneralHomes();
    response.render('funeralHomes/search', {
        headTitle: i18next.t('contracts:funeralHomeSearch', { lng: response.locals.lng }),
        funeralHomes,
        error
    });
}
