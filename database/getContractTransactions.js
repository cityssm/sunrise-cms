import { dateIntegerToString, timeIntegerToString } from '@cityssm/utils-datetime';
import { getConfigProperty } from '../helpers/config.helpers.js';
import { getDatabaseConnection } from '../helpers/database.helpers.js';
let getDynamicsGpDocument;
if (getConfigProperty('integrations.dynamicsGp.integrationIsEnabled')) {
    const dynamicsGpHelpers = await import('../integrations/dynamicsGp/helpers.js');
    getDynamicsGpDocument = dynamicsGpHelpers.getDynamicsGpDocument;
}
export default async function getContractTransactions(contractId, options, connectedDatabase) {
    const database = connectedDatabase ?? getDatabaseConnection();
    database.function('userFn_dateIntegerToString', {
        deterministic: true
    }, (dateInteger) => dateIntegerToString(dateInteger));
    database.function('userFn_timeIntegerToString', {
        deterministic: true
    }, (timeInteger) => timeIntegerToString(timeInteger));
    const contractIds = Array.isArray(contractId) ? contractId : [contractId];
    const contractIdPlaceholders = contractIds.map(() => '?').join(', ');
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
        t.paymentTypeId,
        pt.paymentType,
        transactionNote
      FROM
        ContractTransactions t
        LEFT JOIN PaymentTypes pt ON t.paymentTypeId = pt.paymentTypeId
      WHERE
        t.recordDelete_timeMillis IS NULL
        AND t.contractId IN (${contractIdPlaceholders})
      ORDER BY
        t.transactionDate,
        t.transactionTime,
        t.transactionIndex
    `)
        .all(...contractIds);
    if (connectedDatabase === undefined) {
        database.close();
    }
    if (options.includeIntegrations &&
        getConfigProperty('integrations.dynamicsGp.integrationIsEnabled')) {
        for (const transaction of contractTransactions) {
            if ((transaction.externalReceiptNumber ?? '') === '') {
                continue;
            }
            const gpDocument = await getDynamicsGpDocument(transaction.externalReceiptNumber ?? '');
            if (gpDocument !== undefined) {
                transaction.dynamicsGpDocument = gpDocument;
            }
        }
    }
    return contractTransactions;
}
