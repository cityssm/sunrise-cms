import type { Request, Response } from 'express'

import { deleteRecord } from '../../database/deleteRecord.js'
import {
  getAllContractTypeFields,
  getContractTypes
} from '../../helpers/functions.cache.js'

export default async function handler(
  request: Request<unknown, unknown, { contractTypeId: string }>,
  response: Response
): Promise<void> {
  const success = await deleteRecord(
    'OccupancyTypes',
    request.body.contractTypeId as string,
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
