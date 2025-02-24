import type { Request, Response } from 'express'

import deleteContractTypePrint from '../../database/deleteContractTypePrint.js'
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
  const success = await deleteContractTypePrint(
    request.body.contractTypeId,
    request.body.printEJS,
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
