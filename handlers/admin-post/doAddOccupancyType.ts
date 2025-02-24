import type { Request, Response } from 'express'

import { addRecord } from '../../database/addRecord.js'
import {
  getAllContractTypeFields,
  getContractTypes
} from '../../helpers/functions.cache.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const contractTypeId = await addRecord(
    'OccupancyTypes',
    request.body.occupancyType,
    request.body.orderNumber ?? -1,
    request.session.user as User
  )

  const occupancyTypes = await getContractTypes()
  const allContractTypeFields = await getAllContractTypeFields()

  response.json({
    success: true,
    contractTypeId,
    occupancyTypes,
    allContractTypeFields
  })
}
