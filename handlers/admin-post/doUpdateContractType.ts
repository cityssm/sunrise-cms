import type { Request, Response } from 'express'

import { updateRecord } from '../../database/updateRecord.js'
import {
  getAllContractTypeFields,
  getContractTypes
} from '../../helpers/functions.cache.js'

export default async function handler(
  request: Request<
    unknown,
    unknown,
    { contractTypeId: string; contractType: string }
  >,
  response: Response
): Promise<void> {
  const success = await updateRecord(
    'ContractTypes',
    request.body.contractTypeId,
    request.body.contractType,
    request.session.user as User
  )

  const contractTypes = await getContractTypes()
  const allContractTypeFields = await getAllContractTypeFields()

  response.json({
    success,
    contractTypes,
    allContractTypeFields
  })
}
