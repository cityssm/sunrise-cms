import { acquireConnection } from './pool.js'

export default async function getPreviousContractId(
  contractId: number | string
): Promise<number | undefined> {
  const database = await acquireConnection()

  const result = database
    .prepare(
      `select contractId
        from Contracts
        where recordDelete_timeMillis is null
        and contractId < ?
        order by contractId desc
        limit 1`
    )
    .pluck()
    .get(contractId) as number | undefined

  database.release()

  return result
}
