import type { Request, Response } from 'express'

import addContractType, {
  type AddForm
} from '../../database/addContractType.js'
import {
  getAllCachedContractTypeFields,
  getCachedContractTypes
} from '../../helpers/cache/contractTypes.cache.js'
import type {
  ContractType,
  ContractTypeField
} from '../../types/record.types.js'

export type DoAddContractTypeResponse = {
  allContractTypeFields: ContractTypeField[]
  contractTypeId: number
  contractTypes: ContractType[]
}

export default function handler(
  request: Request<unknown, unknown, AddForm>,
  response: Response<DoAddContractTypeResponse>
): void {
  const contractTypeId = addContractType(
    request.body,
    request.session.user as User
  )

  const contractTypes = getCachedContractTypes()
  const allContractTypeFields = getAllCachedContractTypeFields()

  response.json({
    allContractTypeFields,
    contractTypeId,
    contractTypes
  })
}
