import { dateToString } from '@cityssm/utils-datetime'

import type { Contract } from '../types/recordTypes.js'

import addContract from './addContract.js'
import addContractComment from './addContractComment.js'
// import addContractOccupant from './addContractOccupant.js'
import getContract from './getContract.js'
import { acquireConnection } from './pool.js'

export default async function copyContract(
  oldContractId: number | string,
  user: User
): Promise<number> {
  const database = await acquireConnection()

  const oldContract = (await getContract(
    oldContractId,
    database
  )) as Contract

  const newContractId = await addContract(
    {
      burialSiteId: oldContract.burialSiteId ?? '',
      contractTypeId: oldContract.contractTypeId,
      contractStartDateString: dateToString(new Date()),
      contractEndDateString: ''
    },
    user,
    database
  )

  /*
   * Copy Fields
   */

  const rightNowMillis = Date.now()

  for (const field of oldContract.contractFields ?? []) {
    database
      .prepare(
        `insert into ContractFields (
          contractId, contractTypeFieldId, fieldValue,
          recordCreate_userName, recordCreate_timeMillis,
          recordUpdate_userName, recordUpdate_timeMillis)
          values (?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        newContractId,
        field.contractTypeFieldId,
        field.fieldValue,
        user.userName,
        rightNowMillis,
        user.userName,
        rightNowMillis
      )
  }

  /*
   * Copy Occupants
   */

  /*
  for (const occupant of oldContract.contractOccupants ?? []) {
    await addContractOccupant(
      {
        contractId: newContractId,
        lotOccupantTypeId: occupant.lotOccupantTypeId!,
        occupantName: occupant.occupantName!,
        occupantFamilyName: occupant.occupantFamilyName!,
        occupantAddress1: occupant.occupantAddress1!,
        occupantAddress2: occupant.occupantAddress2!,
        occupantCity: occupant.occupantCity!,
        occupantProvince: occupant.occupantProvince!,
        occupantPostalCode: occupant.occupantPostalCode!,
        occupantPhoneNumber: occupant.occupantPhoneNumber!,
        occupantEmailAddress: occupant.occupantEmailAddress!
      },
      user,
      database
    )
  }
  */

  /*
   * Add Comment
   */

  await addContractComment(
    {
      contractId: newContractId,
      comment: `New record copied from #${oldContractId}.`
    },
    user
  )

  database.release()

  return newContractId
}
