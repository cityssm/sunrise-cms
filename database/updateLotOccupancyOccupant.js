import { acquireConnection } from './pool.js';
export default async function updateContractOccupant(contractOccupantForm, user) {
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
        and contractId = ?
        and lotOccupantIndex = ?`)
        .run(contractOccupantForm.occupantName, contractOccupantForm.occupantFamilyName, contractOccupantForm.occupantAddress1, contractOccupantForm.occupantAddress2, contractOccupantForm.occupantCity, contractOccupantForm.occupantProvince, contractOccupantForm.occupantPostalCode, contractOccupantForm.occupantPhoneNumber, contractOccupantForm.occupantEmailAddress, contractOccupantForm.occupantComment, contractOccupantForm.lotOccupantTypeId, user.userName, Date.now(), contractOccupantForm.contractId, contractOccupantForm.lotOccupantIndex);
    database.release();
    return results.changes > 0;
}
