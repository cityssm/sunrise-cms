import type { Request, Response } from 'express'

import { deleteRecord } from '../../database/deleteRecord.js'
import {
  getAllCachedContractTypeFields,
  getCachedContractTypes
} from '../../helpers/cache/contractTypes.cache.js'
import type {
  ContractType,
  ContractTypeField
} from '../../types/record.types.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoDeleteContractTypeResponse = {
  success: boolean

  allContractTypeFields: ContractTypeField[]
  contractTypes: ContractType[]
}

export default function handler(
  request: Request<unknown, unknown, { contractTypeId: string }>,
  response: Response<DoDeleteContractTypeResponse>
): void {
  const success = deleteRecord(
    'ContractTypes',
    request.body.contractTypeId,
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
