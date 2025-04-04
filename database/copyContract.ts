import { dateToString } from '@cityssm/utils-datetime'

import type { Contract } from '../types/recordTypes.js'

import addContract from './addContract.js'
import addContractComment from './addContractComment.js'
import addContractInterment from './addContractInterment.js'
import getContract from './getContract.js'
import { acquireConnection } from './pool.js'

// eslint-disable-next-line complexity
export default async function copyContract(
  oldContractId: number | string,
  user: User
): Promise<number> {
  const database = await acquireConnection()

  const oldContract = (await getContract(oldContractId, database)) as Contract

  const newContractId = await addContract(
    {
      burialSiteId: oldContract.burialSiteId ?? '',
      contractEndDateString: '',
      contractStartDateString: dateToString(new Date()),
      contractTypeId: oldContract.contractTypeId,

      funeralDateString: oldContract.funeralDateString ?? '',
      funeralDirectorName: oldContract.funeralDirectorName,
      funeralHomeId: oldContract.funeralHomeId ?? '',
      funeralTimeString: oldContract.funeralTimeString ?? '',
      purchaserAddress1: oldContract.purchaserAddress1,
      purchaserAddress2: oldContract.purchaserAddress2,
      purchaserCity: oldContract.purchaserCity,
      purchaserEmail: oldContract.purchaserEmail,
      purchaserName: oldContract.purchaserName,

      purchaserPhoneNumber: oldContract.purchaserPhoneNumber,
      purchaserPostalCode: oldContract.purchaserPostalCode,
      purchaserProvince: oldContract.purchaserProvince,
      purchaserRelationship: oldContract.purchaserRelationship
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
   * Copy Interments
   */

  for (const interment of oldContract.contractInterments ?? []) {
    await addContractInterment(
      {
        birthDateString: interment.birthDateString ?? '',
        birthPlace: interment.birthPlace ?? '',
        contractId: newContractId,
        deathAge: interment.deathAge ?? '',
        deathAgePeriod: interment.deathAgePeriod ?? '',
        deathDateString: interment.deathDateString ?? '',
        deathPlace: interment.deathPlace ?? '',

        deceasedAddress1: interment.deceasedAddress1 ?? '',
        deceasedAddress2: interment.deceasedAddress2 ?? '',
        deceasedCity: interment.deceasedCity ?? '',
        deceasedName: interment.deceasedName ?? '',

        deceasedPostalCode: interment.deceasedPostalCode ?? '',
        deceasedProvince: interment.deceasedProvince ?? '',
        intermentContainerTypeId: interment.intermentContainerTypeId ?? ''
      },
      user,
      database
    )
  }

  /*
   * Add Comment
   */

  await addContractComment(
    {
      comment: `New record copied from #${oldContractId}.`,
      contractId: newContractId
    },
    user
  )

  database.release()

  return newContractId
}
