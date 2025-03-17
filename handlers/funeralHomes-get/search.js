import getFuneralHomes from '../../database/getFuneralHomes.js';
export default async function handler(_request, response) {
    const funeralHomes = await getFuneralHomes();
    response.render('funeralHome-search', {
        headTitle: "Funeral Home Search",
        funeralHomes
    });
}
