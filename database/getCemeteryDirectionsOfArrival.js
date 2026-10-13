import { getDatabaseConnection } from '../helpers/database.helpers.js';
export default function getCemeteryDirectionsOfArrival(cemeteryId, connectedDatabase) {
    const database = connectedDatabase ?? getDatabaseConnection(true);
    const directionsList = database
        .prepare(`
      SELECT
        directionOfArrival,
        directionOfArrivalDescription
      FROM
        CemeteryDirectionsOfArrival
      WHERE
        cemeteryId = ?
    `)
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
