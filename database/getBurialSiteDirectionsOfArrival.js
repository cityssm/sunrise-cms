import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
import getCemeteryDirectionsOfArrival from './getCemeteryDirectionsOfArrival.js';
export const defaultDirectionsOfArrival = {
    E: 'East',
    N: 'North',
    S: 'South',
    W: 'West'
};
export default function getBurialSiteDirectionsOfArrival(burialSiteId, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB, { readonly: true });
    const directionsList = database
        .prepare(`select c.parentCemeteryId,
        d.directionOfArrival, d.directionOfArrivalDescription
        from BurialSites b
        left join Cemeteries c on b.cemeteryId = c.cemeteryId
        left join CemeteryDirectionsOfArrival d on c.cemeteryId = d.cemeteryId
        where b.burialSiteId = ?`)
        .all(burialSiteId);
    let directions = {};
    if (directionsList.length === 1 &&
        directionsList[0].directionOfArrival === null &&
        directionsList[0].parentCemeteryId !== null) {
        directions = getCemeteryDirectionsOfArrival(directionsList[0].parentCemeteryId, connectedDatabase);
    }
    else if (directionsList.length > 0 && directionsList[0].directionOfArrival !== null) {
        for (const direction of directionsList) {
            directions[direction.directionOfArrival] =
                direction.directionOfArrivalDescription ?? '';
        }
    }
    if (Object.keys(directions).length === 0) {
        directions = defaultDirectionsOfArrival;
    }
    if (connectedDatabase === undefined) {
        database.close();
    }
    return directions;
}
