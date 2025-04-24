import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'
import type { BurialSiteTypeField } from '../types/record.types.js'

import { updateRecordOrderNumber } from './updateRecordOrderNumber.js'

export default function getBurialSiteTypeFields(
  burialSiteTypeId: number,
  connectedDatabase?: sqlite.Database
): BurialSiteTypeField[] {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  const typeFields = database
    .prepare(
      `select burialSiteTypeFieldId,
        burialSiteTypeField, fieldType, fieldValues,
        isRequired, pattern, minLength, maxLength, orderNumber
        from BurialSiteTypeFields
        where recordDelete_timeMillis is null
        and burialSiteTypeId = ?
        order by orderNumber, burialSiteTypeField`
    )
    .all(burialSiteTypeId) as BurialSiteTypeField[]

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
