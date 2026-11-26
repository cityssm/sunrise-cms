import type { Request, Response } from 'express'

import addContractTypePrint, {
  type AddContractTypePrintForm
} from '../../database/addContractTypePrint.js'
import {
  getAllCachedContractTypeFields,
  getCachedContractTypes
} from '../../helpers/cache/contractTypes.cache.js'
import type {
  ContractType,
  ContractTypeField
} from '../../types/record.types.js'

export type DoAddContractTypePrintResponse = {
  success: boolean

  allContractTypeFields: ContractTypeField[]
  contractTypes: ContractType[]
}

export default function handler(
  request: Request<unknown, unknown, AddContractTypePrintForm>,
  response: Response<DoAddContractTypePrintResponse>
): void {
  const success = addContractTypePrint(
    request.body,
    request.session.user as User
  )

  const contractTypes = getCachedContractTypes()
  const allContractTypeFields = getAllCachedContractTypeFields()

  response.json({
    success,

    allContractTypeFields,
    contractTypes
  })
}
