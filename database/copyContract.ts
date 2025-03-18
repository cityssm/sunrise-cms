import { dateToString } from '@cityssm/utils-datetime'

import type { Contract } from '../types/recordTypes.js'

import addContract from './addContract.js'
import addContractComment from './addContractComment.js'
import addContractInterment from './addContractInterment.js'
import getContract from './getContract.js'
import { acquireConnection } from './pool.js'

export default async function copyContract(
  oldContractId: number | string,
  user: User
): Promise<number> {
  const database = await acquireConnection()

  const oldContract = (await getContract(oldContractId, database)) as Contract

  const newContractId = await addContract(
    {
      burialSiteId: oldContract.burialSiteId ?? '',
      contractTypeId: oldContract.contractTypeId,
      contractStartDateString: dateToString(new Date()),
      contractEndDateString: '',

      purchaserName: oldContract.purchaserName,
      purchaserAddress1: oldContract.purchaserAddress1,
      purchaserAddress2: oldContract.purchaserAddress2,
      purchaserCity: oldContract.purchaserCity,
      purchaserProvince: oldContract.purchaserProvince,
      purchaserPostalCode: oldContract.purchaserPostalCode,
      purchaserPhoneNumber: oldContract.purchaserPhoneNumber,
      purchaserEmail: oldContract.purchaserEmail,
      purchaserRelationship: oldContract.purchaserRelationship,

      funeralHomeId: oldContract.funeralHomeId,
      funeralDirectorName: oldContract.funeralDirectorName,
      funeralDateString: oldContract.funeralDateString ?? '',
      funeralTimeString: oldContract.funeralTimeString ?? ''
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
        contractId: newContractId,
        deceasedName: interment.deceasedName ?? '',
        deceasedAddress1: interment.deceasedAddress1 ?? '',
        deceasedAddress2: interment.deceasedAddress2 ?? '',
        deceasedCity: interment.deceasedCity ?? '',
        deceasedProvince: interment.deceasedProvince ?? '',
        deceasedPostalCode: interment.deceasedPostalCode ?? '',

        birthDateString: interment.birthDateString ?? '',
        birthPlace: interment.birthPlace ?? '',
        deathDateString: interment.deathDateString ?? '',
        deathPlace: interment.deathPlace ?? '',

        deathAge: interment.deathAge ?? '',
        deathAgePeriod: interment.deathAgePeriod ?? '',
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
      contractId: newContractId,
      comment: `New record copied from #${oldContractId}.`
    },
    user
  )

  database.release()

  return newContractId
}
