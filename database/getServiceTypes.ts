import type { DatabaseSync } from 'node:sqlite'

import { getDatabaseConnection } from '../helpers/database.helpers.js'
import type { ServiceType } from '../types/record.types.js'

import updateRecordOrderNumber from './updateRecordOrderNumber.js'

export default function getServiceTypes(
  shouldIncludeDeletedRecords = false,
  connectedDatabase?: DatabaseSync
): ServiceType[] {
  const database = connectedDatabase ?? getDatabaseConnection()

  const updateOrderNumbers = !shouldIncludeDeletedRecords

  const serviceTypes = database
    .prepare(/* sql */ `
      SELECT
        serviceTypeId,
        serviceType,
        isAvailableOnPortal,
        orderNumber
      FROM
        ServiceTypes ${shouldIncludeDeletedRecords
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
