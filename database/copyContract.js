import { dateToString } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
import addContract from './addContract.js';
import addContractComment from './addContractComment.js';
import addContractInterment from './addContractInterment.js';
import addRelatedContract from './addRelatedContract.js';
import getContract from './getContract.js';
// eslint-disable-next-line complexity
export default async function copyContract(oldContractId, user) {
    const database = sqlite(sunriseDB);
    const oldContract = (await getContract(oldContractId, database));
    const newContractId = addContract({
        burialSiteId: oldContract.burialSiteId ?? '',
        contractEndDateString: '',
        contractStartDateString: dateToString(new Date()),
        contractTypeId: oldContract.contractTypeId,
        funeralDateString: oldContract.funeralDateString ?? '',
        funeralDirectorName: oldContract.funeralDirectorName,
        funeralHomeId: oldContract.funeralHomeId ?? '',
        funeralTimeString: oldContract.funeralTimeString ?? '',
        purchaserAddress1: oldContract.purchaserAddress1,
        purchaserAddress2: oldContract.purchaserAddress2,
        purchaserCity: oldContract.purchaserCity,
        purchaserEmail: oldContract.purchaserEmail,
        purchaserName: oldContract.purchaserName,
        purchaserPhoneNumber: oldContract.purchaserPhoneNumber,
        purchaserPostalCode: oldContract.purchaserPostalCode,
        purchaserProvince: oldContract.purchaserProvince,
        purchaserRelationship: oldContract.purchaserRelationship
    }, user, database);
    /*
     * Copy Fields
     */
    const rightNowMillis = Date.now();
    for (const field of oldContract.contractFields ?? []) {
        database
            .prepare(`insert into ContractFields (
          contractId, contractTypeFieldId, fieldValue,
          recordCreate_userName, recordCreate_timeMillis,
          recordUpdate_userName, recordUpdate_timeMillis)
          values (?, ?, ?, ?, ?, ?, ?)`)
            .run(newContractId, field.contractTypeFieldId, field.fieldValue, user.userName, rightNowMillis, user.userName, rightNowMillis);
    }
    /*
     * Copy Interments
     */
    for (const interment of oldContract.contractInterments ?? []) {
        addContractInterment({
            birthDateString: interment.birthDateString ?? '',
            birthPlace: interment.birthPlace ?? '',
            contractId: newContractId,
            deathAge: interment.deathAge ?? '',
            deathAgePeriod: interment.deathAgePeriod ?? '',
            deathDateString: interment.deathDateString ?? '',
            deathPlace: interment.deathPlace ?? '',
            deceasedAddress1: interment.deceasedAddress1 ?? '',
            deceasedAddress2: interment.deceasedAddress2 ?? '',
            deceasedCity: interment.deceasedCity ?? '',
            deceasedName: interment.deceasedName ?? '',
            deceasedPostalCode: interment.deceasedPostalCode ?? '',
            deceasedProvince: interment.deceasedProvince ?? '',
            intermentContainerTypeId: interment.intermentContainerTypeId ?? ''
        }, user, database);
    }
    /*
     * Add Related Contract
     */
    addRelatedContract({
        contractId: newContractId,
        relatedContractId: oldContractId
    });
    /*
     * Add Comment
     */
    addContractComment({
        comment: `New record copied from #${oldContractId}.`,
        contractId: newContractId
    }, user);
    database.close();
    return newContractId;
}
