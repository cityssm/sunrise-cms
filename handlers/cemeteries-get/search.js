import getCemeteries from '../../database/getCemeteries.js';
export default function handler(_request, response) {
    const cemeteries = getCemeteries();
    response.render('cemetery-search', {
        headTitle: 'Cemetery Search',
        cemeteries
    });
}
