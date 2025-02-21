import addOrUpdateLotField from './addOrUpdateLotField.js';
import { acquireConnection } from './pool.js';
export default async function addLot(lotForm, user) {
    const database = await acquireConnection();
    const rightNowMillis = Date.now();
    const result = database
        .prepare(`insert into Lots (
        lotName, lotTypeId, lotStatusId,
        mapId, mapKey,
        lotLatitude, lotLongitude,
        recordCreate_userName, recordCreate_timeMillis,
        recordUpdate_userName, recordUpdate_timeMillis) 
        values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .run(lotForm.lotName, lotForm.lotTypeId, lotForm.lotStatusId === '' ? undefined : lotForm.lotStatusId, lotForm.mapId === '' ? undefined : lotForm.mapId, lotForm.mapKey, lotForm.lotLatitude === '' ? undefined : lotForm.lotLatitude, lotForm.lotLongitude === '' ? undefined : lotForm.lotLongitude, user.userName, rightNowMillis, user.userName, rightNowMillis);
    const lotId = result.lastInsertRowid;
    const lotTypeFieldIds = (lotForm.lotTypeFieldIds ?? '').split(',');
    for (const lotTypeFieldId of lotTypeFieldIds) {
        const lotFieldValue = lotForm[`lotFieldValue_${lotTypeFieldId}`];
        if ((lotFieldValue ?? '') !== '') {
            await addOrUpdateLotField({
                lotId,
                lotTypeFieldId,
                lotFieldValue: lotFieldValue ?? ''
            }, user, database);
        }
    }
    database.release();
    return lotId;
}
