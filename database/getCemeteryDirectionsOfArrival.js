import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function getCemeteryDirectionsOfArrival(cemeteryId, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB, { readonly: true });
    const directionsList = database
        .prepare(/* sql */ `select directionOfArrival, directionOfArrivalDescription
        from CemeteryDirectionsOfArrival
        where cemeteryId = ?`)
        .all(cemeteryId);
    const directions = {};
    for (const direction of directionsList) {
        directions[direction.directionOfArrival] =
            direction.directionOfArrivalDescription;
    }
    if (connectedDatabase === undefined) {
        database.close();
    }
    return directions;
}
