import getFuneralDirectorNamesByFuneralHomeId from '../../database/getFuneralDirectorNamesByFuneralHomeId.js';
export default function handler(request, response) {
    const funeralHomeId = request.body.funeralHomeId;
    const funeralDirectorNames = getFuneralDirectorNamesByFuneralHomeId(funeralHomeId);
    response.json({
        success: true,
        funeralDirectorNames
    });
}
