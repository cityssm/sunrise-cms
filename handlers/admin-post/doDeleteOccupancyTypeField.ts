import type { Request, Response } from 'express'

import { deleteRecord } from '../../database/deleteRecord.js'
import {
  getAllContractTypeFields,
  getContractTypes
} from '../../helpers/functions.cache.js'

export default async function handler(
  request: Request<unknown, unknown, { contractTypeFieldId: string }>,
  response: Response
): Promise<void> {
  const success = await deleteRecord(
    'ContractTypeFields',
    request.body.contractTypeFieldId,
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
