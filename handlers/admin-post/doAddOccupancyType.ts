import type { Request, Response } from 'express'

import {
  getAllOccupancyTypeFields,
  getOccupancyTypes
} from '../../helpers/functions.cache.js'
import { addRecord } from '../../database/addRecord.js'

export async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const occupancyTypeId = await addRecord(
    'OccupancyTypes',
    request.body.occupancyType,
    request.body.orderNumber ?? -1,
    request.session.user as User
  )

  const occupancyTypes = await getOccupancyTypes()
  const allOccupancyTypeFields = await getAllOccupancyTypeFields()

  response.json({
    success: true,
    occupancyTypeId,
    occupancyTypes,
    allOccupancyTypeFields
  })
}

export default handler
