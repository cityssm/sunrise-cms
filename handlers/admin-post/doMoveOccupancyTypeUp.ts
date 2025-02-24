import type { Request, Response } from 'express'

import { moveRecordUp, moveRecordUpToTop } from '../../database/moveRecord.js'
import {
  getAllContractTypeFields,
  getContractTypes
} from '../../helpers/functions.cache.js'

export default async function handler(
  request: Request<
    unknown,
    unknown,
    { contractTypeId: string; moveToEnd: '0' | '1' }
  >,
  response: Response
): Promise<void> {
  const success =
    request.body.moveToEnd === '1'
      ? await moveRecordUpToTop('OccupancyTypes', request.body.contractTypeId)
      : await moveRecordUp('OccupancyTypes', request.body.contractTypeId)

  const occupancyTypes = await getContractTypes()
  const allContractTypeFields = await getAllContractTypeFields()

  response.json({
    success,
    occupancyTypes,
    allContractTypeFields
  })
}
