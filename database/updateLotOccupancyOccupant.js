import { acquireConnection } from './pool.js';
export default async function updateLotOccupancyOccupant(burialSiteContractOccupantForm, user) {
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
        .run(burialSiteContractOccupantForm.occupantName, burialSiteContractOccupantForm.occupantFamilyName, burialSiteContractOccupantForm.occupantAddress1, burialSiteContractOccupantForm.occupantAddress2, burialSiteContractOccupantForm.occupantCity, burialSiteContractOccupantForm.occupantProvince, burialSiteContractOccupantForm.occupantPostalCode, burialSiteContractOccupantForm.occupantPhoneNumber, burialSiteContractOccupantForm.occupantEmailAddress, burialSiteContractOccupantForm.occupantComment, burialSiteContractOccupantForm.lotOccupantTypeId, user.userName, Date.now(), burialSiteContractOccupantForm.burialSiteContractId, burialSiteContractOccupantForm.lotOccupantIndex);
    database.release();
    return results.changes > 0;
}
