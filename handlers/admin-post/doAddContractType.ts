import type { Request, Response } from 'express'

import addRecord from '../../database/addRecord.js'
import {
  getAllContractTypeFields,
  getContractTypes
} from '../../helpers/functions.cache.js'

export default async function handler(
  request: Request<
    unknown,
    unknown,
    { contractType: string; orderNumber?: number | string }
  >,
  response: Response
): Promise<void> {
  const contractTypeId = await addRecord(
    'ContractTypes',
    request.body.contractType,
    request.body.orderNumber ?? -1,
    request.session.user as User
  )

  const contractTypes = await getContractTypes()
  const allContractTypeFields = await getAllContractTypeFields()

  response.json({
    success: true,
    contractTypeId,
    contractTypes,
    allContractTypeFields
  })
}
