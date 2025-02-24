import {
  dateIntegerToString,
  timeIntegerToString
} from '@cityssm/utils-datetime'
import type { PoolConnection } from 'better-sqlite-pool'

import type { BurialSiteContractInterment } from '../types/recordTypes.js'

import { acquireConnection } from './pool.js'

export default async function getBurialSiteContractInterments(
  burialSiteContractId: number | string,
  connectedDatabase?: PoolConnection
): Promise<BurialSiteContractInterment[]> {
  const database = connectedDatabase ?? (await acquireConnection())

  database.function('userFn_dateIntegerToString', dateIntegerToString)
  database.function('userFn_timeIntegerToString', timeIntegerToString)

  const interments = database
    .prepare(
      `select o.burialSiteContractId, o.intermentNumber,
        o.isCremated,
        o.deceasedName,
        birthDate, userFn_dateIntegerToString(birthDate) as birthDateString,
        birthPlace,
        deathDate, userFn_dateIntegerToString(deathDate) as deathDateString,
        deathPlace,

        intermentDate, userFn_dateIntegerToString(intermentDate) as intermentDateString,
        intermentTime, userFn_timeIntegerToString(intermentTime) as intermentTimeString,

        intermentContainerTypeId, t.intermentContainerType,
        intermentCommittalTypeId, c.intermentCommittalType

        from BurialSiteContractInterments o
        left join IntermentContainerTypes t on o.intermentContainerTypeId = t.intermentContainerTypeId
        left join IntermentCommittalTypes c on o.intermentCommittalTypeId = c.intermentCommittalTypeId

        where o.recordDelete_timeMillis is null
        and o.burialSiteContractId = ?
        order by t.orderNumber, o.deceasedName, o.intermentNumber`
    )
    .all(burialSiteContractId) as BurialSiteContractInterment[]

  if (connectedDatabase === undefined) {
    database.release()
  }

  return interments
}
