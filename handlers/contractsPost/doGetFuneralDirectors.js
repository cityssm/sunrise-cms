import getFuneralDirectorNamesByFuneralHomeId from '../../database/getFuneralDirectorNamesByFuneralHomeId.js';
export default function handler(request, response) {
    const { funeralHomeId } = request.body;
    const funeralDirectorNames = getFuneralDirectorNamesByFuneralHomeId(funeralHomeId);
    response.json({
        funeralDirectorNames
    });
}
