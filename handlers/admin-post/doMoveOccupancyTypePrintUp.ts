import type { Request, Response } from 'express'

import {
  moveOccupancyTypePrintUp,
  moveOccupancyTypePrintUpToTop
} from '../../database/moveOccupancyTypePrintUp.js'
import {
  getAllContractTypeFields,
  getContractTypes
} from '../../helpers/functions.cache.js'

export default async function handler(
  request: Request<
    unknown,
    unknown,
    { contractTypeId: string; printEJS: string; moveToEnd: '0' | '1' }
  >,
  response: Response
): Promise<void> {
  const success =
    request.body.moveToEnd === '1'
      ? await moveOccupancyTypePrintUpToTop(
          request.body.contractTypeId,
          request.body.printEJS
        )
      : await moveOccupancyTypePrintUp(
          request.body.contractTypeId,
          request.body.printEJS
        )

  const occupancyTypes = await getContractTypes()
  const allContractTypeFields = await getAllContractTypeFields()

  response.json({
    success,
    occupancyTypes,
    allContractTypeFields
  })
}
