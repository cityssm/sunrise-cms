import type { Request, Response } from 'express'

import {
  getOccupancyTypeById,
  getAllOccupancyTypeFields
} from '../../helpers/functions.cache.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const allOccupancyTypeFields = await getAllOccupancyTypeFields()

  const result = (await getOccupancyTypeById(
    Number.parseInt(request.body.occupancyTypeId, 10)
  ))!

  const occupancyTypeFields = [...allOccupancyTypeFields]

  occupancyTypeFields.push(...(result.occupancyTypeFields ?? []))

  response.json({
    occupancyTypeFields
  })
}

