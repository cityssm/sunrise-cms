import { DatabaseSync } from 'node:sqlite'

import { sunriseDB } from '../helpers/database.helpers.js'
import type { BurialSiteTypeField } from '../types/record.types.js'

import updateRecordOrderNumber from './updateRecordOrderNumber.js'

export default function getBurialSiteTypeFields(
  burialSiteTypeId: number,
  connectedDatabase?: DatabaseSync
): BurialSiteTypeField[] {
  const database = connectedDatabase ?? new DatabaseSync(sunriseDB)

  const typeFields = database
    .prepare(/* sql */ `
      SELECT
        burialSiteTypeFieldId,
        burialSiteTypeField,
        fieldType,
        fieldValues,
        isRequired,
        pattern,
        minLength,
        maxLength,
        orderNumber
      FROM
        BurialSiteTypeFields
      WHERE
        recordDelete_timeMillis IS NULL
        AND burialSiteTypeId = ?
      ORDER BY
        orderNumber,
        burialSiteTypeField
    `)
    .all(burialSiteTypeId) as unknown as BurialSiteTypeField[]

  let expectedOrderNumber = 0

  for (const typeField of typeFields) {
    if (typeField.orderNumber !== expectedOrderNumber) {
      updateRecordOrderNumber(
        'BurialSiteTypeFields',
        typeField.burialSiteTypeFieldId,
        expectedOrderNumber,
        database
      )

      typeField.orderNumber = expectedOrderNumber
    }

    expectedOrderNumber += 1
  }

  if (connectedDatabase === undefined) {
    database.close()
  }

  return typeFields
}
