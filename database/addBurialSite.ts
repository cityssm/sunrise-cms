import sqlite from 'better-sqlite3'

import { buildBurialSiteName } from '../helpers/burialSites.helpers.js'
import { sunriseDB } from '../helpers/database.helpers.js'

import addOrUpdateBurialSiteFields, {
  type BurialSiteFieldsForm
} from './addOrUpdateBurialSiteFields.js'
import getCemetery from './getCemetery.js'
import { purgeBurialSite } from './purgeBurialSite.js'

export interface AddBurialSiteForm extends BurialSiteFieldsForm {
  burialSiteNameSegment1?: string
  burialSiteNameSegment2?: string
  burialSiteNameSegment3?: string
  burialSiteNameSegment4?: string
  burialSiteNameSegment5?: string

  burialSiteStatusId: number | string
  burialSiteTypeId: number | string

  bodyCapacity?: number | string
  crematedCapacity?: number | string

  burialSiteImage?: string
  cemeteryId: number | string
  cemeterySvgId?: string

  burialSiteLatitude?: string
  burialSiteLongitude?: string
}

/**
 * Creates a new burial site.
 * @param burialSiteForm - The new burial site's information
 * @param user - The user making the request
 * @param connectedDatabase - An optional database connection
 * @returns The new burial site's id.
 * @throws If an active burial site with the same name already exists.
 */
// eslint-disable-next-line complexity
export default function addBurialSite(
  burialSiteForm: AddBurialSiteForm,
  user: User,
  connectedDatabase?: sqlite.Database
): { burialSiteId: number; burialSiteName: string } {
  let database: sqlite.Database | undefined

  try {
    database = connectedDatabase ?? sqlite(sunriseDB)

    const rightNowMillis = Date.now()

    const cemetery =
      burialSiteForm.cemeteryId === ''
        ? undefined
        : getCemetery(burialSiteForm.cemeteryId, database)

    const burialSiteName = buildBurialSiteName(
      cemetery?.cemeteryKey,
      burialSiteForm
    )

    // Ensure no active burial sites share the same name

    const existingBurialSite = database
      .prepare(/* sql */ `
        SELECT
          burialSiteId,
          recordDelete_timeMillis
        FROM
          BurialSites
        WHERE
          burialSiteName = ?
      `)
      .get(burialSiteName) as
      | {
          burialSiteId: number
          recordDelete_timeMillis: number | null
        }
      | undefined

    if (existingBurialSite !== undefined) {
      if (existingBurialSite.recordDelete_timeMillis === null) {
        throw new Error(
          `An active burial site with the name "${burialSiteName}" already exists.`
        )
      } else {
        const success = purgeBurialSite(
          existingBurialSite.burialSiteId,
          database
        )

        if (!success) {
          throw new Error(
            `An deleted burial site with the name "${burialSiteName}" previously existed,
              however the burial site is associated with past records and cannot be recreated.`
          )
        }
      }
    }

    const result = database
      .prepare(/* sql */ `
        INSERT INTO
          BurialSites (
            burialSiteNameSegment1,
            burialSiteNameSegment2,
            burialSiteNameSegment3,
            burialSiteNameSegment4,
            burialSiteNameSegment5,
            burialSiteName,
            burialSiteTypeId,
            burialSiteStatusId,
            bodyCapacity,
            crematedCapacity,
            cemeteryId,
            cemeterySvgId,
            burialSiteImage,
            burialSiteLatitude,
            burialSiteLongitude,
            recordCreate_userName,
            recordCreate_timeMillis,
            recordUpdate_userName,
            recordUpdate_timeMillis
          )
        VALUES
          (
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?
          )
      `)
      .run(
        burialSiteForm.burialSiteNameSegment1 ?? '',
        burialSiteForm.burialSiteNameSegment2 ?? '',
        burialSiteForm.burialSiteNameSegment3 ?? '',
        burialSiteForm.burialSiteNameSegment4 ?? '',
        burialSiteForm.burialSiteNameSegment5 ?? '',
        burialSiteName,
        burialSiteForm.burialSiteTypeId,
        burialSiteForm.burialSiteStatusId === ''
          ? undefined
          : burialSiteForm.burialSiteStatusId,

        burialSiteForm.bodyCapacity === ''
          ? undefined
          : burialSiteForm.bodyCapacity,

        burialSiteForm.crematedCapacity === ''
          ? undefined
          : burialSiteForm.crematedCapacity,

        burialSiteForm.cemeteryId === ''
          ? undefined
          : burialSiteForm.cemeteryId,
        burialSiteForm.cemeterySvgId,
        burialSiteForm.burialSiteImage ?? '',
        burialSiteForm.burialSiteLatitude === ''
          ? undefined
          : burialSiteForm.burialSiteLatitude,
        burialSiteForm.burialSiteLongitude === ''
          ? undefined
          : burialSiteForm.burialSiteLongitude,
        user.userName,
        rightNowMillis,
        user.userName,
        rightNowMillis
      )

    const burialSiteId = result.lastInsertRowid as number

    addOrUpdateBurialSiteFields(
      { burialSiteId, fieldForm: burialSiteForm },
      true,
      user,
      database
    )

    return {
      burialSiteId,
      burialSiteName
    }
  } finally {
    if (connectedDatabase === undefined) {
      database?.close()
    }
  }
}
