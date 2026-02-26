import type { Request, Response } from 'express'

import addContractTypeField, {
  type AddContractTypeFieldForm
} from '../../database/addContractTypeField.js'
import {
  getAllCachedContractTypeFields,
  getCachedContractTypes
} from '../../helpers/cache/contractTypes.cache.js'

import type { ContractType, ContractTypeField } from '../../types/record.types.js'


// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoAddContractTypeFieldResponse =
  { success: true; allContractTypeFields: ContractTypeField[]; contractTypeFieldId: number; contractTypes: ContractType[] }

export default function handler(
  request: Request<unknown, unknown, AddContractTypeFieldForm>,
  response: Response<DoAddContractTypeFieldResponse>
): void {
  const contractTypeFieldId = addContractTypeField(
    request.body,
    request.session.user as User
  )

  const contractTypes = getCachedContractTypes()
  const allContractTypeFields = getAllCachedContractTypeFields()

  response.json({
    success: true,

    allContractTypeFields,
    contractTypeFieldId,
    contractTypes
  })
}
