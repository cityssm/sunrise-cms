import { calculateFeeAmount, calculateTaxAmount } from '../helpers/functions.fee.js';
import getBurialSiteContract from './getBurialSiteContract.js';
import getFee from './getFee.js';
import { acquireConnection } from './pool.js';
export default async function addBurialSiteContractFee(addFeeForm, user, connectedDatabase) {
    const database = connectedDatabase ?? (await acquireConnection());
    const rightNowMillis = Date.now();
    // Calculate fee and tax (if not set)
    let feeAmount;
    let taxAmount;
    if ((addFeeForm.feeAmount ?? '') === '') {
        const burialSiteContract = (await getBurialSiteContract(addFeeForm.burialSiteContractId));
        const fee = (await getFee(addFeeForm.feeId));
        feeAmount = calculateFeeAmount(fee, burialSiteContract);
        taxAmount = calculateTaxAmount(fee, feeAmount);
    }
    else {
        feeAmount =
            typeof addFeeForm.feeAmount === 'string'
                ? Number.parseFloat(addFeeForm.feeAmount)
                : 0;
        taxAmount =
            typeof addFeeForm.taxAmount === 'string'
                ? Number.parseFloat(addFeeForm.taxAmount)
                : 0;
    }
    try {
        // Check if record already exists
        const record = database
            .prepare(`select feeAmount, taxAmount, recordDelete_timeMillis
          from BurialSiteContractFees
          where burialSiteContractId = ?
          and feeId = ?`)
            .get(addFeeForm.burialSiteContractId, addFeeForm.feeId);
        if (record !== undefined) {
            if (record.recordDelete_timeMillis !== null) {
                database
                    .prepare(`delete from BurialSiteContractFees
              where recordDelete_timeMillis is not null
              and burialSiteContractId = ?
              and feeId = ?`)
                    .run(addFeeForm.burialSiteContractId, addFeeForm.feeId);
            }
            else if (record.feeAmount === feeAmount &&
                record.taxAmount === taxAmount) {
                database
                    .prepare(`update BurialSiteContractFees
              set quantity = quantity + ?,
              recordUpdate_userName = ?,
              recordUpdate_timeMillis = ?
              where burialSiteContractId = ?
              and feeId = ?`)
                    .run(addFeeForm.quantity, user.userName, rightNowMillis, addFeeForm.burialSiteContractId, addFeeForm.feeId);
                return true;
            }
            else {
                const quantity = typeof addFeeForm.quantity === 'string'
                    ? Number.parseFloat(addFeeForm.quantity)
                    : addFeeForm.quantity;
                database
                    .prepare(`update BurialSiteContractFees
              set feeAmount = (feeAmount * quantity) + ?,
              taxAmount = (taxAmount * quantity) + ?,
              quantity = 1,
              recordUpdate_userName = ?,
              recordUpdate_timeMillis = ?
              where burialSiteContractId = ?
              and feeId = ?`)
                    .run(feeAmount * quantity, taxAmount * quantity, user.userName, rightNowMillis, addFeeForm.burialSiteContractId, addFeeForm.feeId);
                return true;
            }
        }
        // Create new record
        const result = database
            .prepare(`insert into BurialSiteContractFees (
          burialSiteContractId, feeId,
          quantity, feeAmount, taxAmount,
          recordCreate_userName, recordCreate_timeMillis,
          recordUpdate_userName, recordUpdate_timeMillis)
          values (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
            .run(addFeeForm.burialSiteContractId, addFeeForm.feeId, addFeeForm.quantity, feeAmount, taxAmount, user.userName, rightNowMillis, user.userName, rightNowMillis);
        return result.changes > 0;
    }
    finally {
        if (connectedDatabase === undefined) {
            database.release();
        }
    }
}
