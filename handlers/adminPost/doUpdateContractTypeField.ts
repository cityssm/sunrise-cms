import type { Request, Response } from 'express'

import updateContractTypeField, {
  type UpdateContractTypeFieldForm
} from '../../database/updateContractTypeField.js'
import {
  getAllCachedContractTypeFields,
  getCachedContractTypes
} from '../../helpers/cache/contractTypes.cache.js'
import type {
  ContractType,
  ContractTypeField
} from '../../types/record.types.js'

export type DoUpdateContractTypeFieldResponse = {
  success: boolean

  allContractTypeFields: ContractTypeField[]
  contractTypes: ContractType[]
}

export default function handler(
  request: Request<unknown, unknown, UpdateContractTypeFieldForm>,
  response: Response<DoUpdateContractTypeFieldResponse>
): void {
  const success = updateContractTypeField(
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
