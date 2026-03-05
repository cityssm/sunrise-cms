import getObjectDifference from '@cityssm/object-difference'
import sqlite from 'better-sqlite3'

import { buildBurialSiteName } from '../helpers/burialSites.helpers.js'
import { getConfigProperty } from '../helpers/config.helpers.js'
import { sunriseDB } from '../helpers/database.helpers.js'

import type { BurialSiteFieldsForm } from './addOrUpdateBurialSiteFields.js'
import addOrUpdateBurialSiteFields from './addOrUpdateBurialSiteFields.js'
import createAuditLogEntries from './createAuditLogEntries.js'
import getCemetery from './getCemetery.js'

const auditLogIsEnabled = getConfigProperty('settings.auditLog.enabled')

export interface UpdateBurialSiteForm extends BurialSiteFieldsForm {
  burialSiteId: number | string

  burialSiteNameSegment1?: string
  burialSiteNameSegment2?: string
  burialSiteNameSegment3?: string
  burialSiteNameSegment4?: string
  burialSiteNameSegment5?: string

  burialSiteStatusId: number | string
  burialSiteTypeId: number | string

  bodyCapacity?: number | string
  crematedCapacity?: number | string

  burialSiteImage: string
  cemeteryId: number | string
  cemeterySvgId: string

  burialSiteLatitude: string
  burialSiteLongitude: string
}

/**
 * Updates a burial site.
 * @param updateForm - The burial site's updated information
 * @param user - The user making the request
 * @returns True if the burial site was updated.
 * @throws {Error} If an active burial site with the same name already exists.
 */
export default function updateBurialSite(
  updateForm: UpdateBurialSiteForm,
  user: User
): boolean {
  const database = sqlite(sunriseDB)

  const cemetery =
    updateForm.cemeteryId === ''
      ? undefined
      : getCemetery(updateForm.cemeteryId, database)

  const burialSiteName = buildBurialSiteName(cemetery?.cemeteryKey, updateForm)

  // Ensure no active burial sites share the same name

  const existingBurialSite = database
    .prepare(/* sql */ `
      SELECT
        burialSiteId
      FROM
        BurialSites
      WHERE
        burialSiteName = ?
        AND burialSiteId <> ?
        AND recordDelete_timeMillis IS NULL
    `)
    .pluck()
    .get(burialSiteName, updateForm.burialSiteId) as number | undefined

  if (existingBurialSite !== undefined) {
    database.close()
    throw new Error('An active burial site with that name already exists.')
  }

  const recordBefore = auditLogIsEnabled
    ? database
        .prepare(/* sql */ `
          SELECT
            *
          FROM
            BurialSites
          WHERE
            burialSiteId = ?
            AND recordDelete_timeMillis IS NULL
        `)
        .get(updateForm.burialSiteId)
    : undefined

  const result = database
    .prepare(/* sql */ `
      UPDATE BurialSites
      SET
        burialSiteNameSegment1 = ?,
        burialSiteNameSegment2 = ?,
        burialSiteNameSegment3 = ?,
        burialSiteNameSegment4 = ?,
        burialSiteNameSegment5 = ?,
        burialSiteName = ?,
        burialSiteTypeId = ?,
        burialSiteStatusId = ?,
        bodyCapacity = ?,
        crematedCapacity = ?,
        cemeteryId = ?,
        cemeterySvgId = ?,
        burialSiteImage = ?,
        burialSiteLatitude = ?,
        burialSiteLongitude = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
      WHERE
        burialSiteId = ?
        AND recordDelete_timeMillis IS NULL
    `)
    .run(
      updateForm.burialSiteNameSegment1 ?? '',
      updateForm.burialSiteNameSegment2 ?? '',
      updateForm.burialSiteNameSegment3 ?? '',
      updateForm.burialSiteNameSegment4 ?? '',
      updateForm.burialSiteNameSegment5 ?? '',
      burialSiteName,
      updateForm.burialSiteTypeId,
      updateForm.burialSiteStatusId === ''
        ? undefined
        : updateForm.burialSiteStatusId,

      updateForm.bodyCapacity === '' ? undefined : updateForm.bodyCapacity,

      updateForm.crematedCapacity === ''
        ? undefined
        : updateForm.crematedCapacity,

      updateForm.cemeteryId === '' ? undefined : updateForm.cemeteryId,
      updateForm.cemeterySvgId,
      updateForm.burialSiteImage,
      updateForm.burialSiteLatitude === ''
        ? undefined
        : updateForm.burialSiteLatitude,
      updateForm.burialSiteLongitude === ''
        ? undefined
        : updateForm.burialSiteLongitude,
      user.userName,
      Date.now(),
      updateForm.burialSiteId
    )

  if (result.changes > 0) {
    addOrUpdateBurialSiteFields(
      {
        burialSiteId: updateForm.burialSiteId,
        fieldForm: updateForm
      },
      false,
      user,
      database
    )

    if (auditLogIsEnabled) {
      const recordAfter = database
        .prepare(/* sql */ `
          SELECT
            *
          FROM
            BurialSites
          WHERE
            burialSiteId = ?
        `)
        .get(updateForm.burialSiteId)

      const differences = getObjectDifference(recordBefore, recordAfter)

      if (differences.length > 0) {
        createAuditLogEntries(
          {
            mainRecordType: 'burialSite',
            mainRecordId: updateForm.burialSiteId,
            updateTable: 'BurialSites'
          },
          differences,
          user,
          database
        )
      }
    }
  }

  database.close()

  return result.changes > 0
}

export function updateBurialSiteStatus(
  burialSiteId: number | string,
  burialSiteStatusId: number | string,
  user: User,
  connectedDatabase?: sqlite.Database
): boolean {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  const rightNowMillis = Date.now()

  const recordBefore = auditLogIsEnabled
    ? database
        .prepare(/* sql */ `
          SELECT
            *
          FROM
            BurialSites
          WHERE
            burialSiteId = ?
            AND recordDelete_timeMillis IS NULL
        `)
        .get(burialSiteId)
    : undefined

  const result = database
    .prepare(/* sql */ `
      UPDATE BurialSites
      SET
        burialSiteStatusId = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
      WHERE
        burialSiteId = ?
        AND recordDelete_timeMillis IS NULL
    `)
    .run(
      burialSiteStatusId === '' ? undefined : burialSiteStatusId,
      user.userName,
      rightNowMillis,
      burialSiteId
    )

  if (result.changes > 0 && auditLogIsEnabled) {
    const recordAfter = database
      .prepare(/* sql */ `
        SELECT
          *
        FROM
          BurialSites
        WHERE
          burialSiteId = ?
      `)
      .get(burialSiteId)

    const differences = getObjectDifference(recordBefore, recordAfter)

    if (differences.length > 0) {
      createAuditLogEntries(
        {
          mainRecordType: 'burialSite',
          mainRecordId: burialSiteId,
          updateTable: 'BurialSites'
        },
        differences,
        user,
        database
      )
    }
  }

  if (connectedDatabase === undefined) {
    database.close()
  }

  return result.changes > 0
}

export function updateBurialSiteLatitudeLongitude(
  burialSiteId: number | string,
  burialSiteLatitude: string,
  burialSiteLongitude: string,
  user: User
): boolean {
  const database = sqlite(sunriseDB)

  const recordBefore = auditLogIsEnabled
    ? database
        .prepare(/* sql */ `
          SELECT
            *
          FROM
            BurialSites
          WHERE
            burialSiteId = ?
            AND recordDelete_timeMillis IS NULL
        `)
        .get(burialSiteId)
    : undefined

  const result = database
    .prepare(/* sql */ `
      UPDATE BurialSites
      SET
        burialSiteLatitude = ?,
        burialSiteLongitude = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
      WHERE
        burialSiteId = ?
        AND recordDelete_timeMillis IS NULL
    `)
    .run(
      burialSiteLatitude === '' ? undefined : burialSiteLatitude,
      burialSiteLongitude === '' ? undefined : burialSiteLongitude,
      user.userName,
      Date.now(),
      burialSiteId
    )

  if (result.changes > 0 && auditLogIsEnabled) {
    const recordAfter = database
      .prepare(/* sql */ `
        SELECT
          *
        FROM
          BurialSites
        WHERE
          burialSiteId = ?
      `)
      .get(burialSiteId)

    const differences = getObjectDifference(recordBefore, recordAfter)

    if (differences.length > 0) {
      createAuditLogEntries(
        {
          mainRecordType: 'burialSite',
          mainRecordId: burialSiteId,
          updateTable: 'BurialSites'
        },
        differences,
        user,
        database
      )
    }
  }

  database.close()

  return result.changes > 0
}
