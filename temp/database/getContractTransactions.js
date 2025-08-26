import { dateIntegerToString, timeIntegerToString } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
import { getConfigProperty } from '../helpers/config.helpers.js';
import { sunriseDB } from '../helpers/database.helpers.js';
import { getDynamicsGPDocument } from '../integrations/dynamicsGp/helpers.js';
export default async function GetContractTransactions(contractId, options, connectedDatabase) {
    var _a, _b;
    const database = connectedDatabase !== null && connectedDatabase !== void 0 ? connectedDatabase : sqlite(sunriseDB, { readonly: true });
    database.function('userFn_dateIntegerToString', dateIntegerToString);
    database.function('userFn_timeIntegerToString', timeIntegerToString);
    const contractTransactions = database
        .prepare(`select contractId, transactionIndex,
          transactionDate, userFn_dateIntegerToString(transactionDate) as transactionDateString,
          transactionTime, userFn_timeIntegerToString(transactionTime) as transactionTimeString,
          transactionAmount, externalReceiptNumber, isInvoiced, transactionNote
        from ContractTransactions
        where recordDelete_timeMillis is null
          and contractId = ?
        order by transactionDate, transactionTime, transactionIndex`)
        .all(contractId);
    if (connectedDatabase === undefined) {
        database.close();
    }
    if (options.includeIntegrations &&
        getConfigProperty('integrations.dynamicsGP.integrationIsEnabled')) {
        for (const transaction of contractTransactions) {
            if (((_a = transaction.externalReceiptNumber) !== null && _a !== void 0 ? _a : '') !== '') {
                const gpDocument = await getDynamicsGPDocument((_b = transaction.externalReceiptNumber) !== null && _b !== void 0 ? _b : '');
                if (gpDocument !== undefined) {
                    transaction.dynamicsGPDocument = gpDocument;
                }
            }
        }
    }
    return contractTransactions;
}
