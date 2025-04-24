import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
import { calculateFeeAmount, calculateTaxAmount } from '../helpers/functions.fee.js';
import getContract from './getContract.js';
import getFee from './getFee.js';
export default async function addContractFee(addFeeForm, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const rightNowMillis = Date.now();
    // Calculate fee and tax (if not set)
    let feeAmount;
    let taxAmount;
    if ((addFeeForm.feeAmount ?? '') === '') {
        const contract = (await getContract(addFeeForm.contractId));
        const fee = getFee(addFeeForm.feeId);
        feeAmount = calculateFeeAmount(fee, contract);
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
          from ContractFees
          where contractId = ?
          and feeId = ?`)
            .get(addFeeForm.contractId, addFeeForm.feeId);
        if (record !== undefined) {
            if (record.recordDelete_timeMillis !== null) {
                database
                    .prepare(`delete from ContractFees
              where recordDelete_timeMillis is not null
              and contractId = ?
              and feeId = ?`)
                    .run(addFeeForm.contractId, addFeeForm.feeId);
            }
            else if (record.feeAmount === feeAmount &&
                record.taxAmount === taxAmount) {
                database
                    .prepare(`update ContractFees
              set quantity = quantity + ?,
              recordUpdate_userName = ?,
              recordUpdate_timeMillis = ?
              where contractId = ?
              and feeId = ?`)
                    .run(addFeeForm.quantity, user.userName, rightNowMillis, addFeeForm.contractId, addFeeForm.feeId);
                return true;
            }
            else {
                const quantity = typeof addFeeForm.quantity === 'string'
                    ? Number.parseFloat(addFeeForm.quantity)
                    : addFeeForm.quantity;
                database
                    .prepare(`update ContractFees
              set feeAmount = (feeAmount * quantity) + ?,
              taxAmount = (taxAmount * quantity) + ?,
              quantity = 1,
              recordUpdate_userName = ?,
              recordUpdate_timeMillis = ?
              where contractId = ?
              and feeId = ?`)
                    .run(feeAmount * quantity, taxAmount * quantity, user.userName, rightNowMillis, addFeeForm.contractId, addFeeForm.feeId);
                return true;
            }
        }
        // Create new record
        const result = database
            .prepare(`insert into ContractFees (
          contractId, feeId,
          quantity, feeAmount, taxAmount,
          recordCreate_userName, recordCreate_timeMillis,
          recordUpdate_userName, recordUpdate_timeMillis)
          values (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
            .run(addFeeForm.contractId, addFeeForm.feeId, addFeeForm.quantity, feeAmount, taxAmount, user.userName, rightNowMillis, user.userName, rightNowMillis);
        return result.changes > 0;
    }
    finally {
        if (connectedDatabase === undefined) {
            database.close();
        }
    }
}
