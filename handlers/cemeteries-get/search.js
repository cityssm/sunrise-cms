import getCemeteries from '../../database/getCemeteries.js';
export default async function handler(_request, response) {
    const cemeteries = await getCemeteries();
    response.render('cemetery-search', {
        headTitle: "Cemetery Search",
        cemeteries
    });
}
