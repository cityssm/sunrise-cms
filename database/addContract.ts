import {
  type DateString,
  type TimeString,
  dateStringToInteger,
  timeStringToInteger
} from '@cityssm/utils-datetime'
import type { PoolConnection } from 'better-sqlite-pool'

import addOrUpdateContractField from './addOrUpdateContractField.js'
import { acquireConnection } from './pool.js'

export interface AddContractForm {
  contractTypeId: string | number
  burialSiteId: string | number

  contractStartDateString: DateString | ''
  contractEndDateString: DateString | ''

  contractTypeFieldIds?: string
  [fieldValue_contractTypeFieldId: `fieldValue_${string}`]: unknown

  purchaserName?: string
  purchaserAddress1?: string
  purchaserAddress2?: string
  purchaserCity?: string
  purchaserProvince?: string
  purchaserPostalCode?: string
  purchaserPhoneNumber?: string
  purchaserEmail?: string
  purchaserRelationship?: string

  funeralHomeId?: string | number
  funeralDirectorName?: string
  funeralDateString?: DateString | ''
  funeralTimeString?: TimeString | ''
  committalTypeId?: string | number

  deceasedName?: string
  deceasedAddress1?: string
  deceasedAddress2?: string
  deceasedCity?: string
  deceasedProvince?: string
  deceasedPostalCode?: string

  birthDateString?: DateString | ''
  birthPlace?: string
  deathDateString?: DateString | ''
  deathPlace?: string
  intermentContainerTypeId?: string | number
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
          intermentContainerTypeId,
          recordCreate_userName, recordCreate_timeMillis,
          recordUpdate_userName, recordUpdate_timeMillis)
          values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
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
