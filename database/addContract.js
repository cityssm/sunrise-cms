import { dateStringToInteger, timeStringToInteger } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
import Debug from 'debug';
import { DEBUG_NAMESPACE } from '../debug.config.js';
import { getConfigProperty } from '../helpers/config.helpers.js';
import { sunriseDB } from '../helpers/database.helpers.js';
import addContractInterment from './addContractInterment.js';
import addFuneralHome from './addFuneralHome.js';
import addOrUpdateContractField from './addOrUpdateContractField.js';
import createAuditLogEntries from './createAuditLogEntries.js';
import { getAuditableContractRecord } from './getAuditableRecords.js';
import getNextContractNumber from './getNextContractNumber.js';
const debug = Debug(`${DEBUG_NAMESPACE}:addContract`);
const isAuditLoggingEnabled = getConfigProperty('settings.auditLog.enabled');
function ensureFuneralHomeExists(form, user, database) {
    let funeralHomeId = form.funeralHomeId ?? '';
    if (funeralHomeId === 'new') {
        funeralHomeId = addFuneralHome({
            funeralHomeName: form.funeralHomeName ?? '',
            funeralHomeAddress1: form.funeralHomeAddress1 ?? '',
            funeralHomeAddress2: form.funeralHomeAddress2 ?? '',
            funeralHomeCity: form.funeralHomeCity ?? '',
            funeralHomePostalCode: form.funeralHomePostalCode?.toUpperCase() ?? '',
            funeralHomeProvince: form.funeralHomeProvince ?? '',
            funeralHomePhoneNumber: form.funeralHomePhoneNumber ?? ''
        }, user, database);
    }
    return funeralHomeId === '' ? undefined : Number(funeralHomeId);
}
export default function addContract(form, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const funeralHomeId = ensureFuneralHomeExists(form, user, database);
    const rightNowMillis = Date.now();
    let contractNumber = form.contractNumber;
    if ((contractNumber ?? '') === '') {
        contractNumber = getNextContractNumber(database);
    }
    const contractStartDate = dateStringToInteger(form.contractStartDateString);
    try {
        const result = database
            .prepare(`
        INSERT INTO
          Contracts (
            contractNumber,
            contractTypeId,
            burialSiteId,
            contractStartDate,
            contractEndDate,
            purchaserName,
            purchaserAddress1,
            purchaserAddress2,
            purchaserCity,
            purchaserProvince,
            purchaserPostalCode,
            purchaserPhoneNumber,
            purchaserEmail,
            purchaserRelationship,
            funeralHomeId,
            funeralDirectorName,
            funeralDate,
            funeralTime,
            directionOfArrival,
            committalTypeId,
            recordCreate_username,
            recordCreate_timeMillis,
            recordUpdate_username,
            recordUpdate_timeMillis
          )
        VALUES
          (
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?
          )
      `)
            .run(contractNumber, form.contractTypeId, form.burialSiteId === '' ? undefined : form.burialSiteId, contractStartDate, form.contractEndDateString === ''
            ? undefined
            : dateStringToInteger(form.contractEndDateString), form.purchaserName, form.purchaserAddress1, form.purchaserAddress2, form.purchaserCity, form.purchaserProvince, form.purchaserPostalCode.toUpperCase(), form.purchaserPhoneNumber, form.purchaserEmail, form.purchaserRelationship, funeralHomeId, form.funeralDirectorName, form.funeralDateString === ''
            ? undefined
            : dateStringToInteger(form.funeralDateString), form.funeralTimeString === ''
            ? undefined
            : timeStringToInteger(form.funeralTimeString), form.directionOfArrival ?? '', form.committalTypeId === '' ? undefined : form.committalTypeId, user.username, rightNowMillis, user.username, rightNowMillis);
        const contractId = result.lastInsertRowid;
        const contractTypeFieldIds = (form.contractTypeFieldIds ?? '').split(',');
        for (const contractTypeFieldId of contractTypeFieldIds) {
            const fieldValue = form[`fieldValue_${contractTypeFieldId}`];
            if ((fieldValue ?? '') !== '') {
                addOrUpdateContractField({
                    contractId,
                    contractTypeFieldId,
                    fieldValue: fieldValue ?? ''
                }, user, database);
            }
        }
        if ((form.deceasedName ?? '') !== '') {
            addContractInterment({ ...form, contractId }, user, database);
        }
        if (isAuditLoggingEnabled) {
            const recordAfter = getAuditableContractRecord(contractId, database);
            createAuditLogEntries({
                mainRecordId: contractId,
                mainRecordType: 'contract',
                updateTable: 'Contracts'
            }, [
                {
                    property: '*',
                    type: 'created',
                    from: undefined,
                    to: recordAfter
                }
            ], user, database);
        }
        return contractId;
    }
    catch (error) {
        debug('Error adding contract:', error);
        debug('Add Form:', form);
        throw error;
    }
    finally {
        if (connectedDatabase === undefined) {
            database.close();
        }
    }
}
