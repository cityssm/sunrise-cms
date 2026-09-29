import { DatabaseSync } from 'node:sqlite';
import { dateIntegerToString, timeIntegerToString } from '@cityssm/utils-datetime';
import { getConfigProperty } from '../helpers/config.helpers.js';
import { sunriseDB } from '../helpers/database.helpers.js';
let getDynamicsGPDocument;
if (getConfigProperty('integrations.dynamicsGP.integrationIsEnabled')) {
    const dynamicsGpHelpers = await import('../integrations/dynamicsGp/helpers.js');
    getDynamicsGPDocument = dynamicsGpHelpers.getDynamicsGPDocument;
}
export default async function getContractTransactions(contractId, options, connectedDatabase) {
    const database = connectedDatabase ?? new DatabaseSync(sunriseDB);
    database.function('userFn_dateIntegerToString', (dateInteger) => dateIntegerToString(dateInteger));
    database.function('userFn_timeIntegerToString', (timeInteger) => timeIntegerToString(timeInteger));
    const contractTransactions = database
        .prepare(`
      SELECT
        contractId,
        transactionIndex,
        transactionDate,
        userFn_dateIntegerToString (transactionDate) AS transactionDateString,
        transactionTime,
        userFn_timeIntegerToString (transactionTime) AS transactionTimeString,
        transactionAmount,
        externalReceiptNumber,
        isInvoiced,
        transactionNote
      FROM
        ContractTransactions
      WHERE
        recordDelete_timeMillis IS NULL
        AND contractId = ?
      ORDER BY
        transactionDate,
        transactionTime,
        transactionIndex
    `)
        .all(contractId);
    if (connectedDatabase === undefined) {
        database.close();
    }
    if (options.includeIntegrations &&
        getConfigProperty('integrations.dynamicsGP.integrationIsEnabled')) {
        for (const transaction of contractTransactions) {
            if ((transaction.externalReceiptNumber ?? '') === '') {
                continue;
            }
            const gpDocument = await getDynamicsGPDocument(transaction.externalReceiptNumber ?? '');
            if (gpDocument !== undefined) {
                transaction.dynamicsGPDocument = gpDocument;
            }
        }
    }
    return contractTransactions;
}
