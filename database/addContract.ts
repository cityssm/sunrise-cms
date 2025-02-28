import { type DateString, dateStringToInteger } from '@cityssm/utils-datetime'
import type { PoolConnection } from 'better-sqlite-pool'

import addOrUpdateContractField from './addOrUpdateContractField.js'
import { acquireConnection } from './pool.js'

export interface AddContractForm {
  contractTypeId: string | number
  burialSiteId: string | number

  contractStartDateString: string
  contractEndDateString: string

  contractTypeFieldIds?: string
  [fieldValue_contractTypeFieldId: string]: unknown

  lotOccupantTypeId?: string
  occupantName?: string
  occupantFamilyName?: string
  occupantAddress1?: string
  occupantAddress2?: string
  occupantCity?: string
  occupantProvince?: string
  occupantPostalCode?: string
  occupantPhoneNumber?: string
  occupantEmailAddress?: string
  occupantComment?: string
}

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
        contractTypeId, lotId,
        contractStartDate, contractEndDate,
        recordCreate_userName, recordCreate_timeMillis,
        recordUpdate_userName, recordUpdate_timeMillis)
        values (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      addForm.contractTypeId,
      addForm.burialSiteId === '' ? undefined : addForm.burialSiteId,
      contractStartDate,
      addForm.contractEndDateString === ''
        ? undefined
        : dateStringToInteger(addForm.contractEndDateString as DateString),
      user.userName,
      rightNowMillis,
      user.userName,
      rightNowMillis
    )

  const contractId = result.lastInsertRowid as number

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

  if (connectedDatabase === undefined) {
    database.release()
  }

  return contractId
}
