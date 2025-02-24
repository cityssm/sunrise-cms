import type { Request, Response } from 'express'

import { updateRecord } from '../../database/updateRecord.js'
import {
  getAllContractTypeFields,
  getContractTypes
} from '../../helpers/functions.cache.js'

export default async function handler(
  request: Request<
    unknown,
    unknown,
    { contractTypeId: string; occupancyType: string }
  >,
  response: Response
): Promise<void> {
  const success = await updateRecord(
    'OccupancyTypes',
    request.body.contractTypeId,
    request.body.occupancyType,
    request.session.user as User
  )

  const occupancyTypes = await getContractTypes()
  const allContractTypeFields = await getAllContractTypeFields()

  response.json({
    success,
    occupancyTypes,
    allContractTypeFields
  })
}
