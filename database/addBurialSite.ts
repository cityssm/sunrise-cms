import { buildBurialSiteName } from '../helpers/burialSites.helpers.js'

import addOrUpdateBurialSiteField from './addOrUpdateBurialSiteField.js'
import getCemetery from './getCemetery.js'
import { acquireConnection } from './pool.js'

export interface AddBurialSiteForm {
  burialSiteNameSegment1?: string
  burialSiteNameSegment2?: string
  burialSiteNameSegment3?: string
  burialSiteNameSegment4?: string
  burialSiteNameSegment5?: string

  burialSiteStatusId: number | string
  burialSiteTypeId: number | string

  burialSiteImage: string
  cemeteryId: number | string
  cemeterySvgId: string

  burialSiteLatitude: string
  burialSiteLongitude: string

  burialSiteTypeFieldIds?: string
  
  [fieldValue_burialSiteTypeFieldId: string]: unknown
}

/**
 * Creates a new burial site.
 * @param burialSiteForm - The new burial site's information
 * @param user - The user making the request
 * @returns The new burial site's id.
 * @throws If an active burial site with the same name already exists.
 */
export default async function addBurialSite(
  burialSiteForm: AddBurialSiteForm,
  user: User
): Promise<number> {
  const database = await acquireConnection()

  const rightNowMillis = Date.now()

  const cemetery =
    burialSiteForm.cemeteryId === ''
      ? undefined
      : await getCemetery(burialSiteForm.cemeteryId, database)

  const burialSiteName = buildBurialSiteName(
    cemetery?.cemeteryKey,
    burialSiteForm
  )

  // Ensure no active burial sites share the same name

  const existingBurialSite = database
    .prepare(
      `select burialSiteId
        from BurialSites
        where burialSiteName = ?
        and recordDelete_timeMillis is null`
    )
    .pluck()
    .get(burialSiteName) as number | undefined

  if (existingBurialSite !== undefined) {
    database.release()
    throw new Error('An active burial site with that name already exists.')
  }

  const result = database
    .prepare(
      `insert into BurialSites (
        burialSiteNameSegment1,
        burialSiteNameSegment2,
        burialSiteNameSegment3,
        burialSiteNameSegment4,
        burialSiteNameSegment5,
        burialSiteName,
        burialSiteTypeId, burialSiteStatusId,
        cemeteryId, cemeterySvgId, burialSiteImage,
        burialSiteLatitude, burialSiteLongitude,

        recordCreate_userName, recordCreate_timeMillis,
        recordUpdate_userName, recordUpdate_timeMillis) 
        values (?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?)`
    )
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
      burialSiteForm.cemeteryId === '' ? undefined : burialSiteForm.cemeteryId,
      burialSiteForm.cemeterySvgId,
      burialSiteForm.burialSiteImage,
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

  const burialSiteTypeFieldIds = (
    burialSiteForm.burialSiteTypeFieldIds ?? ''
  ).split(',')

  for (const burialSiteTypeFieldId of burialSiteTypeFieldIds) {
    const fieldValue = burialSiteForm[
      `burialSiteFieldValue_${burialSiteTypeFieldId}`
    ] as string | undefined

    if ((fieldValue ?? '') !== '') {
      await addOrUpdateBurialSiteField(
        {
          burialSiteId,
          burialSiteTypeFieldId,
          fieldValue: fieldValue ?? ''
        },
        user,
        database
      )
    }
  }

  database.release()

  return burialSiteId
}
