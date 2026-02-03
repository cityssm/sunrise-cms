import {
  type DateString,
  type TimeString,
  dateStringToInteger,
  timeStringToInteger
} from '@cityssm/utils-datetime'
import sqlite from 'better-sqlite3'
import Debug from 'debug'

import { DEBUG_NAMESPACE } from '../debug.config.js'
import { sunriseDB } from '../helpers/database.helpers.js'

import addContractInterment from './addContractInterment.js'
import addFuneralHome from './addFuneralHome.js'
import addOrUpdateContractField from './addOrUpdateContractField.js'

const debug = Debug(`${DEBUG_NAMESPACE}:addContract`)

export interface AddContractForm {
  burialSiteId: number | string
  contractEndDateString: '' | DateString
  contractStartDateString: '' | DateString
  contractTypeId: number | string

  [fieldValue_contractTypeFieldId: `fieldValue_${string}`]: unknown
  contractTypeFieldIds?: string

  committalTypeId?: number | string
  directionOfArrival?: string
  funeralDateString?: '' | DateString
  funeralDirectorName?: string
  funeralHomeId?: '' | 'new' | `${number}` | number
  funeralTimeString?: '' | TimeString

  funeralHomeAddress1?: string
  funeralHomeAddress2?: string
  funeralHomeCity?: string
  // Optional on create
  funeralHomeName?: string
  funeralHomePhoneNumber?: string
  funeralHomePostalCode?: string
  funeralHomeProvince?: string

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
export default function addContract(
  addForm: AddContractForm,
  user: User,
  connectedDatabase?: sqlite.Database
): number {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  let funeralHomeId = addForm.funeralHomeId ?? ''

  if (funeralHomeId === 'new') {
    funeralHomeId = addFuneralHome(
      {
        funeralHomeName: addForm.funeralHomeName ?? '',

        funeralHomeAddress1: addForm.funeralHomeAddress1 ?? '',
        funeralHomeAddress2: addForm.funeralHomeAddress2 ?? '',
        funeralHomeCity: addForm.funeralHomeCity ?? '',
        funeralHomePostalCode: addForm.funeralHomePostalCode ?? '',
        funeralHomeProvince: addForm.funeralHomeProvince ?? '',

        funeralHomePhoneNumber: addForm.funeralHomePhoneNumber ?? ''
      },
      user,
      database
    )
  }

  const rightNowMillis = Date.now()

  const contractStartDate = dateStringToInteger(
    addForm.contractStartDateString as DateString
  )

  try {
    const result = database
      .prepare(/* sql */ `insert into Contracts (
        contractTypeId, burialSiteId,
        contractStartDate, contractEndDate,
        purchaserName, purchaserAddress1, purchaserAddress2,
        purchaserCity, purchaserProvince, purchaserPostalCode,
        purchaserPhoneNumber, purchaserEmail, purchaserRelationship,
        funeralHomeId, funeralDirectorName,
        funeralDate, funeralTime,
        directionOfArrival, committalTypeId,
        recordCreate_userName, recordCreate_timeMillis,
        recordUpdate_userName, recordUpdate_timeMillis)
        values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        addForm.contractTypeId,
        addForm.burialSiteId === '' ? undefined : addForm.burialSiteId,
        contractStartDate,
        addForm.contractEndDateString === ''
          ? undefined
          : dateStringToInteger(addForm.contractEndDateString),
        addForm.purchaserName ?? '',
        addForm.purchaserAddress1 ?? '',
        addForm.purchaserAddress2 ?? '',
        addForm.purchaserCity ?? '',
        addForm.purchaserProvince ?? '',
        addForm.purchaserPostalCode ?? '',
        addForm.purchaserPhoneNumber ?? '',
        addForm.purchaserEmail ?? '',
        addForm.purchaserRelationship ?? '',
        funeralHomeId === '' ? undefined : funeralHomeId,
        addForm.funeralDirectorName ?? '',
        addForm.funeralDateString === ''
          ? undefined
          : dateStringToInteger(addForm.funeralDateString as DateString),
        addForm.funeralTimeString === ''
          ? undefined
          : timeStringToInteger(addForm.funeralTimeString as TimeString),
        addForm.directionOfArrival ?? '',
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
        addOrUpdateContractField(
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
      addContractInterment({ ...addForm, contractId }, user, database)
    }

    
    return contractId
  } catch (error) {
    debug('Error adding contract:', error)
    debug('Add Form:', addForm)

    throw error
  } finally {
    
    if (connectedDatabase === undefined) {
      database.close()
    }
  }
}
