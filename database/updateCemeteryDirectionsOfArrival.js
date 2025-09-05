import { directionsOfArrival } from '../helpers/dataLists.js';
export default function updateCemeteryDirectionsOfArrival(cemeteryId, updateForm, database) {
    database
        .prepare(`delete from CemeteryDirectionsOfArrival
        where cemeteryId = ?`)
        .run(cemeteryId);
    let updateCount = 0;
    for (const direction of directionsOfArrival) {
        const directionDescriptionName = `directionOfArrivalDescription_${direction}`;
        if (directionDescriptionName in updateForm) {
            database
                .prepare(`insert into CemeteryDirectionsOfArrival (
            cemeteryId, directionOfArrival, directionOfArrivalDescription)
            values (?, ?, ?)`)
                .run(cemeteryId, direction, updateForm[directionDescriptionName] ?? '');
            updateCount += 1;
        }
    }
    return updateCount;
}
