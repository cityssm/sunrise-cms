import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'
import type { ServiceType } from '../types/record.types.js'

export default function getContractServiceTypes(
  contractId: number | string,
  connectedDatabase: sqlite.Database | undefined = undefined
): ServiceType[] {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  const serviceTypes = database
    .prepare(/* sql */ `
      SELECT
        st.serviceTypeId,
        st.serviceType,
        cst.contractServiceDetails
      FROM
        ContractServiceTypes cst
      INNER JOIN
        ServiceTypes st ON cst.serviceTypeId = st.serviceTypeId
      WHERE
        cst.contractId = ?
        AND cst.recordDelete_timeMillis IS NULL
        AND st.recordDelete_timeMillis IS NULL
      ORDER BY
        st.orderNumber,
        st.serviceType
    `)
    .all(contractId) as ServiceType[]

  if (connectedDatabase === undefined) {
    database.close()
  }

  return serviceTypes
}
