import getFuneralHomes from '../../database/getFuneralHomes.js';
export default function handler(_request, response) {
    const funeralHomes = getFuneralHomes();
    response.render('funeralHome-search', {
        headTitle: 'Funeral Home Search',
        funeralHomes
    });
}
