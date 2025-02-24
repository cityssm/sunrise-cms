import { acquireConnection } from './pool.js';
export default async function updateLotOccupancyOccupant(lotOccupancyOccupantForm, user) {
    const database = await acquireConnection();
    const results = database
        .prepare(`update LotOccupancyOccupants
        set occupantName = ?,
        occupantFamilyName = ?,
        occupantAddress1 = ?,
        occupantAddress2 = ?,
        occupantCity = ?,
        occupantProvince = ?,
        occupantPostalCode = ?,
        occupantPhoneNumber = ?,
        occupantEmailAddress = ?,
        occupantComment = ?,
        lotOccupantTypeId = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
        where recordDelete_timeMillis is null
        and burialSiteContractId = ?
        and lotOccupantIndex = ?`)
        .run(lotOccupancyOccupantForm.occupantName, lotOccupancyOccupantForm.occupantFamilyName, lotOccupancyOccupantForm.occupantAddress1, lotOccupancyOccupantForm.occupantAddress2, lotOccupancyOccupantForm.occupantCity, lotOccupancyOccupantForm.occupantProvince, lotOccupancyOccupantForm.occupantPostalCode, lotOccupancyOccupantForm.occupantPhoneNumber, lotOccupancyOccupantForm.occupantEmailAddress, lotOccupancyOccupantForm.occupantComment, lotOccupancyOccupantForm.lotOccupantTypeId, user.userName, Date.now(), lotOccupancyOccupantForm.burialSiteContractId, lotOccupancyOccupantForm.lotOccupantIndex);
    database.release();
    return results.changes > 0;
}
