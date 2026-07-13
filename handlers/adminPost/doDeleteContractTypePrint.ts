import type { Request, Response } from 'express'

import deleteContractTypePrint from '../../database/deleteContractTypePrint.js'
import {
  getAllCachedContractTypeFields,
  getCachedContractTypes
} from '../../helpers/cache/contractTypes.cache.js'
import type {
  ContractType,
  ContractTypeField
} from '../../types/record.types.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoDeleteContractTypePrintResponse = {
  success: boolean

  allContractTypeFields: ContractTypeField[]
  contractTypes: ContractType[]
}

export default function handler(
  request: Request<
    unknown,
    unknown,
    { contractTypeId: string; printEJS: string }
  >,
  response: Response<DoDeleteContractTypePrintResponse>
): void {
  const success = deleteContractTypePrint(
    request.body.contractTypeId,
    request.body.printEJS,
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
