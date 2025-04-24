import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'
import type { BurialSiteField } from '../types/record.types.js'

export default function getBurialSiteFields(
  burialSiteId: number | string,
  connectedDatabase?: sqlite.Database
): BurialSiteField[] {
  const database = connectedDatabase ?? sqlite(sunriseDB, { readonly: true })

  const burialSiteFields = database
    .prepare(
      `select l.burialSiteId, l.burialSiteTypeFieldId,
        l.fieldValue,
        f.burialSiteTypeField, f.fieldType, f.fieldValues,
        f.isRequired, f.pattern, f.minLength, f.maxLength,
        f.orderNumber, t.orderNumber as burialSiteTypeOrderNumber
        from BurialSiteFields l
        left join BurialSiteTypeFields f on l.burialSiteTypeFieldId = f.burialSiteTypeFieldId
        left join BurialSiteTypes t on f.burialSiteTypeId = t.burialSiteTypeId
        where l.recordDelete_timeMillis is null
        and l.burialSiteId = ?
    
        union
    
        select ? as burialSiteId, f.burialSiteTypeFieldId,
        '' as fieldValue,
        f.burialSiteTypeField, f.fieldType, f.fieldValues,
        f.isRequired, f.pattern, f.minLength, f.maxLength,
        f.orderNumber, t.orderNumber as burialSiteTypeOrderNumber
        from BurialSiteTypeFields f
        left join BurialSiteTypes t on f.burialSiteTypeId = t.burialSiteTypeId
        where f.recordDelete_timeMillis is null
        and (
            f.burialSiteTypeId is null
            or f.burialSiteTypeId in (select burialSiteTypeId from BurialSites where burialSiteId = ?))
        and f.burialSiteTypeFieldId not in (select burialSiteTypeFieldId from BurialSiteFields where burialSiteId = ? and recordDelete_timeMillis is null)
        order by burialSiteTypeOrderNumber, f.orderNumber, f.burialSiteTypeField`
    )
    .all(
      burialSiteId,
      burialSiteId,
      burialSiteId,
      burialSiteId
    ) as BurialSiteField[]

  if (connectedDatabase === undefined) {
    database.close()
  }

  return burialSiteFields
}
