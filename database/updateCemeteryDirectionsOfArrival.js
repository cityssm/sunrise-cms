import { directionsOfArrival } from '../helpers/dataLists.js';
export default function updateCemeteryDirectionsOfArrival(cemeteryId, updateForm, database) {
    database
        .prepare(`
      DELETE FROM CemeteryDirectionsOfArrival
      WHERE
        cemeteryId = ?
    `)
        .run(cemeteryId);
    let updateCount = 0;
    for (const direction of directionsOfArrival) {
        const directionDescriptionName = `directionOfArrivalDescription_${direction}`;
        if (Object.hasOwn(updateForm, directionDescriptionName)) {
            database
                .prepare(`
          INSERT INTO
            CemeteryDirectionsOfArrival (
              cemeteryId,
              directionOfArrival,
              directionOfArrivalDescription,
              isAvailableOnPortal
            )
          VALUES
            (?, ?, ?, ?)
        `)
                .run(cemeteryId, direction, updateForm[directionDescriptionName] ?? '', updateForm[`isAvailableOnPortal_${direction}`] ?? '0');
            updateCount += 1;
        }
    }
    return updateCount;
}
