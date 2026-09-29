import { DatabaseSync } from 'node:sqlite'

import { sunriseDB } from '../helpers/database.helpers.js'
import type { ServiceType } from '../types/record.types.js'

import updateRecordOrderNumber from './updateRecordOrderNumber.js'

export default function getServiceTypes(
  includeDeleted = false,
  connectedDatabase?: DatabaseSync
): ServiceType[] {
  const database = connectedDatabase ?? new DatabaseSync(sunriseDB)

  const updateOrderNumbers = !includeDeleted

  const serviceTypes = database
    // eslint-disable-next-line sqlite-security/no-unsafe-query
    .prepare(/* sql */ `
      SELECT
        serviceTypeId,
        serviceType,
        isAvailableOnPortal,
        orderNumber
      FROM
        ServiceTypes ${includeDeleted
          ? ''
          : ' WHERE recordDelete_timeMillis IS NULL '}
      ORDER BY
        orderNumber,
        serviceType,
        serviceTypeId
    `)
    .all() as unknown as ServiceType[]

  if (updateOrderNumbers) {
    let expectedOrderNumber = -1

    for (const serviceType of serviceTypes) {
      expectedOrderNumber += 1

      if (serviceType.orderNumber === expectedOrderNumber) {
        continue
      }

      updateRecordOrderNumber(
        'ServiceTypes',
        serviceType.serviceTypeId,
        expectedOrderNumber,
        database
      )

      serviceType.orderNumber = expectedOrderNumber
    }
  }

  if (connectedDatabase === undefined) {
    database.close()
  }

  return serviceTypes
}
