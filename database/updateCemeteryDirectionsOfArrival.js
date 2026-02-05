import { directionsOfArrival } from '../helpers/dataLists.js';
export default function updateCemeteryDirectionsOfArrival(cemeteryId, updateForm, database) {
    database
        .prepare(/* sql */ `
      DELETE FROM CemeteryDirectionsOfArrival
      WHERE
        cemeteryId = ?
    `)
        .run(cemeteryId);
    let updateCount = 0;
    for (const direction of directionsOfArrival) {
        const directionDescriptionName = `directionOfArrivalDescription_${direction}`;
        if (directionDescriptionName in updateForm) {
            database
                .prepare(/* sql */ `
          INSERT INTO
            CemeteryDirectionsOfArrival (
              cemeteryId,
              directionOfArrival,
              directionOfArrivalDescription
            )
          VALUES
            (?, ?, ?)
        `)
                .run(cemeteryId, direction, updateForm[directionDescriptionName] ?? '');
            updateCount += 1;
        }
    }
    return updateCount;
}
