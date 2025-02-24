import type { Request, Response } from 'express'

import {
  moveOccupancyTypeFieldDown,
  moveOccupancyTypeFieldDownToBottom
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
      ? await moveOccupancyTypeFieldDownToBottom(
          request.body.contractTypeFieldId
        )
      : await moveOccupancyTypeFieldDown(request.body.contractTypeFieldId)

  const occupancyTypes = await getContractTypes()
  const allContractTypeFields = await getAllContractTypeFields()

  response.json({
    success,
    occupancyTypes,
    allContractTypeFields
  })
}
