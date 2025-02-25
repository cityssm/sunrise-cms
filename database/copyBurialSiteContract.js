import { dateToString } from '@cityssm/utils-datetime';
import addBurialSiteContract from './addBurialSiteContract.js';
import addBurialSiteContractComment from './addBurialSiteContractComment.js';
// import addBurialSiteContractOccupant from './addBurialSiteContractOccupant.js'
import getBurialSiteContract from './getBurialSiteContract.js';
import { acquireConnection } from './pool.js';
export default async function copyBurialSiteContract(oldBurialSiteContractId, user) {
    const database = await acquireConnection();
    const oldBurialSiteContract = await getBurialSiteContract(oldBurialSiteContractId, database);
    const newBurialSiteContractId = await addBurialSiteContract({
        burialSiteId: oldBurialSiteContract.burialSiteId ?? '',
        contractTypeId: oldBurialSiteContract.contractTypeId,
        contractStartDateString: dateToString(new Date()),
        contractEndDateString: ''
    }, user, database);
    /*
     * Copy Fields
     */
    const rightNowMillis = Date.now();
    for (const field of oldBurialSiteContract.burialSiteContractFields ?? []) {
        database
            .prepare(`insert into BurialSiteContractFields (
          burialSiteContractId, contractTypeFieldId, fieldValue,
          recordCreate_userName, recordCreate_timeMillis,
          recordUpdate_userName, recordUpdate_timeMillis)
          values (?, ?, ?, ?, ?, ?, ?)`)
            .run(newBurialSiteContractId, field.contractTypeFieldId, field.fieldValue, user.userName, rightNowMillis, user.userName, rightNowMillis);
    }
    /*
     * Copy Occupants
     */
    /*
    for (const occupant of oldBurialSiteContract.burialSiteContractOccupants ?? []) {
      await addBurialSiteContractOccupant(
        {
          burialSiteContractId: newBurialSiteContractId,
          lotOccupantTypeId: occupant.lotOccupantTypeId!,
          occupantName: occupant.occupantName!,
          occupantFamilyName: occupant.occupantFamilyName!,
          occupantAddress1: occupant.occupantAddress1!,
          occupantAddress2: occupant.occupantAddress2!,
          occupantCity: occupant.occupantCity!,
          occupantProvince: occupant.occupantProvince!,
          occupantPostalCode: occupant.occupantPostalCode!,
          occupantPhoneNumber: occupant.occupantPhoneNumber!,
          occupantEmailAddress: occupant.occupantEmailAddress!
        },
        user,
        database
      )
    }
    */
    /*
     * Add Comment
     */
    await addBurialSiteContractComment({
        burialSiteContractId: newBurialSiteContractId,
        comment: `New record copied from #${oldBurialSiteContractId}.`
    }, user);
    database.release();
    return newBurialSiteContractId;
}
