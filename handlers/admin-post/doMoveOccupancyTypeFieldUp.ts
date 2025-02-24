import type { Request, Response } from 'express'

import {
  moveOccupancyTypeFieldUp,
  moveOccupancyTypeFieldUpToTop
} from '../../database/moveOccupancyTypeField.js'
import {
  getAllContractTypeFields,
  getContractTypes
} from '../../helpers/functions.cache.js'

export default async function handler(
  request: Request<
    unknown,
    unknown,
    { contractTypeFieldId: string; moveToEnd: '0' | '1' }
  >,
  response: Response
): Promise<void> {
  const success =
    request.body.moveToEnd === '1'
      ? await moveOccupancyTypeFieldUpToTop(request.body.contractTypeFieldId)
      : await moveOccupancyTypeFieldUp(request.body.contractTypeFieldId)

  const occupancyTypes = await getContractTypes()
  const allContractTypeFields = await getAllContractTypeFields()

  response.json({
    success,
    occupancyTypes,
    allContractTypeFields
  })
}
