import { type DateString, dateStringToInteger } from '@cityssm/utils-datetime'
import type { PoolConnection } from 'better-sqlite-pool'

import addBurialSiteContractOccupant from './addBurialSiteContractOccupant.js'
import addOrUpdateBurialSiteContractField from './addOrUpdateBurialSiteContractField.js'
import { acquireConnection } from './pool.js'

export interface AddBurialSiteContractForm {
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

export default async function addBurialSiteContract(
  addForm: AddBurialSiteContractForm,
  user: User,
  connectedDatabase?: PoolConnection
): Promise<number> {
  const database = connectedDatabase ?? (await acquireConnection())

  const rightNowMillis = Date.now()

  const contractStartDate = dateStringToInteger(
    addForm.contractStartDateString as DateString
  )

  if (contractStartDate <= 0) {
    console.error(addForm)
  }

  const result = database
    .prepare(
      `insert into BurialSiteContracts (
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
        : dateStringToInteger(
            addForm.contractEndDateString as DateString
          ),
      user.userName,
      rightNowMillis,
      user.userName,
      rightNowMillis
    )

  const burialSiteContractId = result.lastInsertRowid as number

  const contractTypeFieldIds = (
    addForm.contractTypeFieldIds ?? ''
  ).split(',')

  for (const contractTypeFieldId of contractTypeFieldIds) {
    const burialSiteContractFieldValue = addForm[
      `burialSiteContractFieldValue_${contractTypeFieldId}`
    ] as string | undefined

    if ((burialSiteContractFieldValue ?? '') !== '') {
      await addOrUpdateBurialSiteContractField(
        {
          burialSiteContractId,
          contractTypeFieldId,
          burialSiteContractFieldValue: burialSiteContractFieldValue ?? ''
        },
        user,
        database
      )
    }
  }

  if ((addForm.lotOccupantTypeId ?? '') !== '') {
    await addBurialSiteContractOccupant(
      {
        burialSiteContractId,
        lotOccupantTypeId: addForm.lotOccupantTypeId ?? '',
        occupantName: addForm.occupantName ?? '',
        occupantFamilyName: addForm.occupantFamilyName ?? '',
        occupantAddress1: addForm.occupantAddress1 ?? '',
        occupantAddress2: addForm.occupantAddress2 ?? '',
        occupantCity: addForm.occupantCity ?? '',
        occupantProvince: addForm.occupantProvince ?? '',
        occupantPostalCode: addForm.occupantPostalCode ?? '',
        occupantPhoneNumber: addForm.occupantPhoneNumber ?? '',
        occupantEmailAddress: addForm.occupantEmailAddress ?? '',
        occupantComment: addForm.occupantComment ?? ''
      },
      user,
      database
    )
  }

  if (connectedDatabase === undefined) {
    database.release()
  }

  return burialSiteContractId
}
