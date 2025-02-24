import addOrUpdateBurialSiteField from './addOrUpdateBurialSiteField.js'
import { acquireConnection } from './pool.js'

export interface AddBurialSiteForm {
  burialSiteNameSegment1: string
  burialSiteNameSegment2?: string
  burialSiteNameSegment3?: string
  burialSiteNameSegment4?: string
  burialSiteNameSegment5?: string

  burialSiteTypeId: string | number
  burialSiteStatusId: string | number

  cemeteryId: string | number
  cemeterySvgId: string

  burialSiteLatitude: string
  burialSiteLongitude: string

  burialSiteTypeFieldIds?: string
  [fieldValue_burialSiteTypeFieldId: string]: unknown
}

export default async function addLot(
  burialSiteForm: AddBurialSiteForm,
  user: User
): Promise<number> {
  const database = await acquireConnection()

  const rightNowMillis = Date.now()

  const result = database
    .prepare(
      `insert into BurialSites (
        burialSiteNameSegment1,
        burialSiteNameSegment2,
        burialSiteNameSegment3,
        burialSiteNameSegment4,
        burialSiteNameSegment5,
        burialSiteTypeId, burialSiteStatusId,
        cemeteryId, cemeterySvgId,
        burialSiteLatitude, burialSiteLongitude,

        recordCreate_userName, recordCreate_timeMillis,
        recordUpdate_userName, recordUpdate_timeMillis) 
        values (?,
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?)`
    )
    .run(
      burialSiteForm.burialSiteNameSegment1,
      burialSiteForm.burialSiteNameSegment2 ?? '',
      burialSiteForm.burialSiteNameSegment3 ?? '',
      burialSiteForm.burialSiteNameSegment4 ?? '',
      burialSiteForm.burialSiteNameSegment5 ?? '',
      burialSiteForm.burialSiteTypeId,
      burialSiteForm.burialSiteStatusId === '' ? undefined : burialSiteForm.burialSiteStatusId,
      burialSiteForm.cemeteryId === '' ? undefined : burialSiteForm.cemeteryId,
      burialSiteForm.cemeterySvgId,
      burialSiteForm.burialSiteLatitude === '' ? undefined : burialSiteForm.burialSiteLatitude,
      burialSiteForm.burialSiteLongitude === '' ? undefined : burialSiteForm.burialSiteLongitude,
      user.userName,
      rightNowMillis,
      user.userName,
      rightNowMillis
    )

  const burialSiteId = result.lastInsertRowid as number

  const burialSiteTypeFieldIds = (burialSiteForm.burialSiteTypeFieldIds ?? '').split(',')

  for (const burialSiteTypeFieldId of burialSiteTypeFieldIds) {
    const fieldValue = burialSiteForm[`burialSiteFieldValue_${burialSiteTypeFieldId}`] as string | undefined

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
