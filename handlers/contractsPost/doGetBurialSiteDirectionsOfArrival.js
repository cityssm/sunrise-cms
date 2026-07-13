import getBurialSiteDirectionsOfArrival, { defaultDirectionsOfArrival } from '../../database/getBurialSiteDirectionsOfArrival.js';
export default function handler(request, response) {
    const directionsOfArrival = request.body.burialSiteId === ''
        ? defaultDirectionsOfArrival
        : getBurialSiteDirectionsOfArrival(request.body.burialSiteId);
    response.json({
        directionsOfArrival
    });
}
