import type { Request, Response } from 'express'

import addContractTypePrint, {
  type AddContractTypePrintForm
} from '../../database/addContractTypePrint.js'
import {
  getAllContractTypeFields,
  getContractTypes
} from '../../helpers/functions.cache.js'

export default function handler(
  request: Request<unknown, unknown, AddContractTypePrintForm>,
  response: Response
): void {
  const success = addContractTypePrint(
    request.body,
    request.session.user as User
  )

  const contractTypes = getContractTypes()
  const allContractTypeFields = getAllContractTypeFields()

  response.json({
    success,

    allContractTypeFields,
    contractTypes
  })
}
