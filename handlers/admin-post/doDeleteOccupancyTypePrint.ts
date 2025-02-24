import type { Request, Response } from 'express'

import deleteOccupancyTypePrint from '../../database/deleteOccupancyTypePrint.js'
import {
  getAllContractTypeFields,
  getContractTypes
} from '../../helpers/functions.cache.js'

export default async function handler(
  request: Request<
    unknown,
    unknown,
    { contractTypeId: string; printEJS: string }
  >,
  response: Response
): Promise<void> {
  const success = await deleteOccupancyTypePrint(
    request.body.contractTypeId,
    request.body.printEJS,
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
