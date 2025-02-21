import { acquireConnection } from './pool.js'

export default async function deleteBurialSiteContractFee(
  burialSiteContractId: number | string,
  feeId: number | string,
  user: User
): Promise<boolean> {
  const database = await acquireConnection()

  const result = database
    .prepare(
      `update BurialSteContractFees
        set recordDelete_userName = ?,
        recordDelete_timeMillis = ?
        where burialSiteContractId = ?
        and feeId = ?`
    )
    .run(user.userName, Date.now(), burialSiteContractId, feeId)

  database.release()

  return result.changes > 0
}
