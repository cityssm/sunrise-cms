import { acquireConnection } from './pool.js'

export interface UpdateLotOccupancyOccupantForm {
  burialSiteContractId: string | number
  lotOccupantIndex: string | number
  lotOccupantTypeId: string | number
  occupantName: string
  occupantFamilyName: string
  occupantAddress1: string
  occupantAddress2: string
  occupantCity: string
  occupantProvince: string
  occupantPostalCode: string
  occupantPhoneNumber: string
  occupantEmailAddress: string
  occupantComment: string
}

export default async function updateBurialSiteContractOccupant(
  burialSiteContractOccupantForm: UpdateLotOccupancyOccupantForm,
  user: User
): Promise<boolean> {
  const database = await acquireConnection()

  const results = database
    .prepare(
      `update LotOccupancyOccupants
        set occupantName = ?,
        occupantFamilyName = ?,
        occupantAddress1 = ?,
        occupantAddress2 = ?,
        occupantCity = ?,
        occupantProvince = ?,
        occupantPostalCode = ?,
        occupantPhoneNumber = ?,
        occupantEmailAddress = ?,
        occupantComment = ?,
        lotOccupantTypeId = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
        where recordDelete_timeMillis is null
        and burialSiteContractId = ?
        and lotOccupantIndex = ?`
    )
    .run(
      burialSiteContractOccupantForm.occupantName,
      burialSiteContractOccupantForm.occupantFamilyName,
      burialSiteContractOccupantForm.occupantAddress1,
      burialSiteContractOccupantForm.occupantAddress2,
      burialSiteContractOccupantForm.occupantCity,
      burialSiteContractOccupantForm.occupantProvince,
      burialSiteContractOccupantForm.occupantPostalCode,
      burialSiteContractOccupantForm.occupantPhoneNumber,
      burialSiteContractOccupantForm.occupantEmailAddress,
      burialSiteContractOccupantForm.occupantComment,
      burialSiteContractOccupantForm.lotOccupantTypeId,
      user.userName,
      Date.now(),
      burialSiteContractOccupantForm.burialSiteContractId,
      burialSiteContractOccupantForm.lotOccupantIndex
    )

  database.release()

  return results.changes > 0
}
