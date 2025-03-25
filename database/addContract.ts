import type { PoolConnection } from 'better-sqlite-pool'

import {
  type DateString,
  type TimeString,
  dateStringToInteger,
  timeStringToInteger
} from '@cityssm/utils-datetime'

import addOrUpdateContractField from './addOrUpdateContractField.js'
import { acquireConnection } from './pool.js'

export interface AddContractForm {
  burialSiteId: number | string
  contractEndDateString: '' | DateString
  contractStartDateString: '' | DateString
  contractTypeId: number | string

  [fieldValue_contractTypeFieldId: `fieldValue_${string}`]: unknown
  contractTypeFieldIds?: string

  committalTypeId?: number | string
  funeralDateString?: '' | DateString
  funeralDirectorName?: string
  funeralHomeId?: number | string
  funeralTimeString?: '' | TimeString

  purchaserAddress1?: string
  purchaserAddress2?: string
  purchaserCity?: string
  purchaserEmail?: string
  purchaserName?: string
  purchaserPhoneNumber?: string
  purchaserPostalCode?: string
  purchaserProvince?: string
  purchaserRelationship?: string

  birthDateString?: '' | DateString
  birthPlace?: string
  deathAge?: string
  deathAgePeriod?: string
  deathDateString?: '' | DateString
  deathPlace?: string
  deceasedAddress1?: string
  deceasedAddress2?: string
  deceasedCity?: string
  deceasedName?: string
  deceasedPostalCode?: string
  deceasedProvince?: string
  intermentContainerTypeId?: number | string
}

// eslint-disable-next-line complexity
export default async function addContract(
  addForm: AddContractForm,
  user: User,
  connectedDatabase?: PoolConnection
): Promise<number> {
  const database = connectedDatabase ?? (await acquireConnection())

  const rightNowMillis = Date.now()

  const contractStartDate = dateStringToInteger(
    addForm.contractStartDateString as DateString
  )

  const result = database
    .prepare(
      `insert into Contracts (
        contractTypeId, burialSiteId,
        contractStartDate, contractEndDate,
        purchaserName, purchaserAddress1, purchaserAddress2,
        purchaserCity, purchaserProvince, purchaserPostalCode,
        purchaserPhoneNumber, purchaserEmail, purchaserRelationship,
        funeralHomeId, funeralDirectorName,
        funeralDate, funeralTime,
        committalTypeId,
        recordCreate_userName, recordCreate_timeMillis,
        recordUpdate_userName, recordUpdate_timeMillis)
        values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      addForm.contractTypeId,
      addForm.burialSiteId === '' ? undefined : addForm.burialSiteId,
      contractStartDate,
      addForm.contractEndDateString === ''
        ? undefined
        : dateStringToInteger(addForm.contractEndDateString as DateString),
      addForm.purchaserName ?? '',
      addForm.purchaserAddress1 ?? '',
      addForm.purchaserAddress2 ?? '',
      addForm.purchaserCity ?? '',
      addForm.purchaserProvince ?? '',
      addForm.purchaserPostalCode ?? '',
      addForm.purchaserPhoneNumber ?? '',
      addForm.purchaserEmail ?? '',
      addForm.purchaserRelationship ?? '',
      addForm.funeralHomeId === '' ? undefined : addForm.funeralHomeId,
      addForm.funeralDirectorName ?? '',
      addForm.funeralDateString === ''
        ? undefined
        : dateStringToInteger(addForm.funeralDateString as DateString),
      addForm.funeralTimeString === ''
        ? undefined
        : timeStringToInteger(addForm.funeralTimeString as TimeString),
      addForm.committalTypeId === '' ? undefined : addForm.committalTypeId,
      user.userName,
      rightNowMillis,
      user.userName,
      rightNowMillis
    )

  const contractId = result.lastInsertRowid as number

  /*
   * Add contract fields
   */

  const contractTypeFieldIds = (addForm.contractTypeFieldIds ?? '').split(',')

  for (const contractTypeFieldId of contractTypeFieldIds) {
    const fieldValue = addForm[`fieldValue_${contractTypeFieldId}`] as
      | string
      | undefined

    if ((fieldValue ?? '') !== '') {
      await addOrUpdateContractField(
        {
          contractId,
          contractTypeFieldId,
          fieldValue: fieldValue ?? ''
        },
        user,
        database
      )
    }
  }

  /*
   * Add deceased information
   */

  if ((addForm.deceasedName ?? '') !== '') {
    database
      .prepare(
        `insert into ContractInterments (
          contractId, intermentNumber,
          deceasedName, deceasedAddress1, deceasedAddress2,
          deceasedCity, deceasedProvince, deceasedPostalCode,
          birthDate, deathDate,
          birthPlace, deathPlace,
          deathAge, deathAgePeriod,
          intermentContainerTypeId,
          recordCreate_userName, recordCreate_timeMillis,
          recordUpdate_userName, recordUpdate_timeMillis)
          values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )

      .run(
        contractId,
        1,
        addForm.deceasedName ?? '',
        addForm.deceasedAddress1 ?? '',
        addForm.deceasedAddress2 ?? '',
        addForm.deceasedCity ?? '',
        addForm.deceasedProvince ?? '',
        addForm.deceasedPostalCode ?? '',
        addForm.birthDateString === ''
          ? undefined
          : dateStringToInteger(addForm.birthDateString as DateString),
        addForm.deathDateString === ''
          ? undefined
          : dateStringToInteger(addForm.deathDateString as DateString),
        addForm.birthPlace ?? '',
        addForm.deathPlace ?? '',
        addForm.deathAge ?? undefined,
        addForm.deathAgePeriod ?? '',
        addForm.intermentContainerTypeId === ''
          ? undefined
          : addForm.intermentContainerTypeId,
        user.userName,
        rightNowMillis,
        user.userName,
        rightNowMillis
      )
  }

  if (connectedDatabase === undefined) {
    database.release()
  }

  return contractId
}
