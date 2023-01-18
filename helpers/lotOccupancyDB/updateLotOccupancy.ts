/* eslint-disable @typescript-eslint/indent */

import { acquireConnection } from './pool.js'

import { dateStringToInteger } from '@cityssm/expressjs-server-js/dateTimeFns.js'

import { addOrUpdateLotOccupancyField } from './addOrUpdateLotOccupancyField.js'

import { deleteLotOccupancyField } from './deleteLotOccupancyField.js'

import type * as recordTypes from '../../types/recordTypes'

interface UpdateLotOccupancyForm {
  lotOccupancyId: string | number
  occupancyTypeId: string | number
  lotId: string | number

  occupancyStartDateString: string
  occupancyEndDateString: string

  occupancyTypeFieldIds?: string
  [lotOccupancyFieldValue_occupancyTypeFieldId: string]: unknown
}

export async function updateLotOccupancy(
  lotOccupancyForm: UpdateLotOccupancyForm,
  requestSession: recordTypes.PartialSession
): Promise<boolean> {
  const database = await acquireConnection()

  const rightNowMillis = Date.now()

  const result = database
    .prepare(
      `update LotOccupancies
        set occupancyTypeId = ?,
        lotId = ?,
        occupancyStartDate = ?,
        occupancyEndDate = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
        where lotOccupancyId = ?
        and recordDelete_timeMillis is null`
    )
    .run(
      lotOccupancyForm.occupancyTypeId,
      lotOccupancyForm.lotId === '' ? undefined : lotOccupancyForm.lotId,
      dateStringToInteger(lotOccupancyForm.occupancyStartDateString),
      lotOccupancyForm.occupancyEndDateString === ''
        ? undefined
        : dateStringToInteger(lotOccupancyForm.occupancyEndDateString),
      requestSession.user!.userName,
      rightNowMillis,
      lotOccupancyForm.lotOccupancyId
    )

  if (result.changes > 0) {
    const occupancyTypeFieldIds = (
      lotOccupancyForm.occupancyTypeFieldIds ?? ''
    ).split(',')

    for (const occupancyTypeFieldId of occupancyTypeFieldIds) {
      const lotOccupancyFieldValue = lotOccupancyForm[
        'lotOccupancyFieldValue_' + occupancyTypeFieldId
      ] as string

      await (lotOccupancyFieldValue && lotOccupancyFieldValue !== ''
        ? addOrUpdateLotOccupancyField(
            {
              lotOccupancyId: lotOccupancyForm.lotOccupancyId,
              occupancyTypeFieldId,
              lotOccupancyFieldValue
            },
            requestSession,
            database
          )
        : deleteLotOccupancyField(
            lotOccupancyForm.lotOccupancyId,
            occupancyTypeFieldId,
            requestSession,
            database
          ))
    }
  }

  database.release()

  return result.changes > 0
}

export default updateLotOccupancy
