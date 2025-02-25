import { dateIntegerToString, timeIntegerToString } from '@cityssm/utils-datetime';
import { getConfigProperty } from '../helpers/config.helpers.js';
import { getDynamicsGPDocument } from '../helpers/functions.dynamicsGP.js';
import { acquireConnection } from './pool.js';
export default async function GetBurialSiteContractTransactions(burialSiteContractId, options, connectedDatabase) {
    const database = connectedDatabase ?? (await acquireConnection());
    database.function('userFn_dateIntegerToString', dateIntegerToString);
    database.function('userFn_timeIntegerToString', timeIntegerToString);
    const burialSiteContractTransactions = database
        .prepare(`select burialSiteContractId, transactionIndex,
        transactionDate, userFn_dateIntegerToString(transactionDate) as transactionDateString,
        transactionTime, userFn_timeIntegerToString(transactionTime) as transactionTimeString,
        transactionAmount, externalReceiptNumber, transactionNote
        from BurialSiteContractTransactions
        where recordDelete_timeMillis is null
        and burialSiteContractId = ?
        order by transactionDate, transactionTime, transactionIndex`)
        .all(burialSiteContractId);
    if (connectedDatabase === undefined) {
        database.release();
    }
    if (options.includeIntegrations &&
        getConfigProperty('settings.dynamicsGP.integrationIsEnabled')) {
        for (const transaction of burialSiteContractTransactions) {
            if ((transaction.externalReceiptNumber ?? '') !== '') {
                const gpDocument = await getDynamicsGPDocument(transaction.externalReceiptNumber ?? '');
                if (gpDocument !== undefined) {
                    transaction.dynamicsGPDocument = gpDocument;
                }
            }
        }
    }
    return burialSiteContractTransactions;
}
