import { DatabaseSync } from 'node:sqlite';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function getContractServiceTypes(contractId, connectedDatabase) {
    const database = connectedDatabase ?? new DatabaseSync(sunriseDB, { readOnly: true });
    const serviceTypes = database
        .prepare(`
      SELECT
        st.serviceTypeId,
        st.serviceType,
        cst.contractServiceDetails
      FROM
        ContractServiceTypes cst
        INNER JOIN ServiceTypes st ON cst.serviceTypeId = st.serviceTypeId
      WHERE
        cst.contractId = ?
        AND cst.recordDelete_timeMillis IS NULL
        AND st.recordDelete_timeMillis IS NULL
      ORDER BY
        st.orderNumber,
        st.serviceType
    `)
        .all(contractId);
    if (connectedDatabase === undefined) {
        database.close();
    }
    return serviceTypes;
}
