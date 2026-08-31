import {
  type DateString,
  type TimeString,
  dateStringToInteger,
  timeStringToInteger
} from '@cityssm/utils-datetime'
import sqlite from 'better-sqlite3'
import Debug from 'debug'

import { DEBUG_NAMESPACE } from '../debug.config.js'
import { getConfigProperty } from '../helpers/config.helpers.js'
import { sunriseDB } from '../helpers/database.helpers.js'

import addContractInterment from './addContractInterment.js'
import addFuneralHome from './addFuneralHome.js'
import addOrUpdateContractField from './addOrUpdateContractField.js'
import createAuditLogEntries from './createAuditLogEntries.js'
import { getAuditableContractRecord } from './getAuditableRecords.js'
import getNextContractNumber from './getNextContractNumber.js'

const debug = Debug(`${DEBUG_NAMESPACE}:addContract`)

const isAuditLoggingEnabled = getConfigProperty('settings.auditLog.enabled')

interface AddContractFuneralHome {
  funeralHomeId?: '' | 'new' | `${number}` | number

  // Optional on create
  funeralHomeAddress1?: string
  funeralHomeAddress2?: string
  funeralHomeCity?: string
  funeralHomeName?: string
  funeralHomePhoneNumber?: string
  funeralHomePostalCode?: string
  funeralHomeProvince?: string
}

export interface AddContractForm extends AddContractFuneralHome {
  contractNumber?: string

  burialSiteId: number | string
  contractEndDateString: '' | DateString
  contractStartDateString: '' | DateString
  contractTypeId: number | string

  [fieldValue_contractTypeFieldId: `fieldValue_${string}`]: unknown
  contractTypeFieldIds?: string

  committalTypeId?: number | string
  directionOfArrival?: string
  funeralDateString?: '' | DateString
  funeralDirectorName: string

  funeralTimeString?: '' | TimeString

  purchaserAddress1: string
  purchaserAddress2: string
  purchaserCity: string
  purchaserEmail: string
  purchaserName: string
  purchaserPhoneNumber: string
  purchaserPostalCode: string
  purchaserProvince: string
  purchaserRelationship: string

  birthDay?: number | string
  birthMonth?: number | string
  birthYear?: number | string

  birthPlace?: string

  deathAge?: string
  deathAgePeriod?: string

  deathDay?: number | string
  deathMonth?: number | string
  deathYear?: number | string

  deathPlace?: string
  deceasedAddress1?: string
  deceasedAddress2?: string
  deceasedCity?: string
  deceasedName?: string
  deceasedPostalCode?: string
  deceasedProvince?: string

  intermentContainerTypeId?: number | string
  intermentDepthId?: number | string

  findagraveMemorialId?: string
}

function ensureFuneralHomeExists(
  form: AddContractFuneralHome,
  user: User,
  database: sqlite.Database
): number | undefined {
  let funeralHomeId = form.funeralHomeId ?? ''

  if (funeralHomeId === 'new') {
    funeralHomeId = addFuneralHome(
      {
        funeralHomeName: form.funeralHomeName ?? '',

        funeralHomeAddress1: form.funeralHomeAddress1 ?? '',
        funeralHomeAddress2: form.funeralHomeAddress2 ?? '',
        funeralHomeCity: form.funeralHomeCity ?? '',
        funeralHomePostalCode:
          form.funeralHomePostalCode?.toUpperCase() ?? '',
        funeralHomeProvince: form.funeralHomeProvince ?? '',

        funeralHomePhoneNumber: form.funeralHomePhoneNumber ?? ''
      },
      user,
      database
    )
  }

  return funeralHomeId === '' ? undefined : Number(funeralHomeId)
}

export default function addContract(
  form: AddContractForm,
  user: User,
  connectedDatabase?: sqlite.Database
): number {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  const funeralHomeId = ensureFuneralHomeExists(form, user, database)

  const rightNowMillis = Date.now()

  let contractNumber = form.contractNumber

  if ((contractNumber ?? '') === '') {
    contractNumber = getNextContractNumber(database)
  }

  const contractStartDate = dateStringToInteger(
    form.contractStartDateString as DateString
  )

  try {
    const result = database
      .prepare(/* sql */ `
        INSERT INTO
          Contracts (
            contractNumber,
            contractTypeId,
            burialSiteId,
            contractStartDate,
            contractEndDate,
            purchaserName,
            purchaserAddress1,
            purchaserAddress2,
            purchaserCity,
            purchaserProvince,
            purchaserPostalCode,
            purchaserPhoneNumber,
            purchaserEmail,
            purchaserRelationship,
            funeralHomeId,
            funeralDirectorName,
            funeralDate,
            funeralTime,
            directionOfArrival,
            committalTypeId,
            recordCreate_username,
            recordCreate_timeMillis,
            recordUpdate_username,
            recordUpdate_timeMillis
          )
        VALUES
          (
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?
          )
      `)
      .run(
        contractNumber,
        form.contractTypeId,
        form.burialSiteId === '' ? undefined : form.burialSiteId,
        contractStartDate,
        form.contractEndDateString === ''
          ? undefined
          : dateStringToInteger(form.contractEndDateString),
        form.purchaserName,
        form.purchaserAddress1,
        form.purchaserAddress2,
        form.purchaserCity,
        form.purchaserProvince,
        form.purchaserPostalCode.toUpperCase(),
        form.purchaserPhoneNumber,
        form.purchaserEmail,
        form.purchaserRelationship,
        funeralHomeId,
        form.funeralDirectorName,
        form.funeralDateString === ''
          ? undefined
          : dateStringToInteger(form.funeralDateString as DateString),
        form.funeralTimeString === ''
          ? undefined
          : timeStringToInteger(form.funeralTimeString as TimeString),
        form.directionOfArrival ?? '',
        form.committalTypeId === '' ? undefined : form.committalTypeId,
        user.username,
        rightNowMillis,
        user.username,
        rightNowMillis
      )

    const contractId = result.lastInsertRowid as number

    /*
     * Add contract fields
     */

    const contractTypeFieldIds = (form.contractTypeFieldIds ?? '').split(',')

    for (const contractTypeFieldId of contractTypeFieldIds) {
      const fieldValue = form[`fieldValue_${contractTypeFieldId}`] as
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

    if ((form.deceasedName ?? '') !== '') {
      addContractInterment({ ...form, contractId }, user, database)
    }

    if (isAuditLoggingEnabled) {
      const recordAfter = getAuditableContractRecord(contractId, database)

      createAuditLogEntries(
        {
          mainRecordId: contractId,
          mainRecordType: 'contract',
          updateTable: 'Contracts'
        },
        [
          {
            property: '*',
            type: 'created',

            from: undefined,
            to: recordAfter
          }
        ],
        user,
        database
      )
    }

    return contractId
  } catch (error) {
    debug('Error adding contract:', error)
    debug('Add Form:', form)

    throw error
  } finally {
    if (connectedDatabase === undefined) {
      database.close()
    }
  }
}
