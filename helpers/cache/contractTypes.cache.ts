import getContractTypeFieldsFromDatabase from '../../database/getContractTypeFields.js'
import getContractTypesFromDatabase from '../../database/getContractTypes.js'
import type { ContractType, ContractTypeField } from '../../types/record.types.js'
import { getConfigProperty } from '../config.helpers.js'

let contractTypes: ContractType[] | undefined
let allContractTypeFields: ContractTypeField[] | undefined

export function getAllCachedContractTypeFields(): ContractTypeField[] {
  allContractTypeFields ??= getContractTypeFieldsFromDatabase()
  return allContractTypeFields
}

export function getCachedContractTypeByContractType(
  contractTypeString: string,
  includeDeleted = false
): ContractType | undefined {
  const cachedTypes = getCachedContractTypes(includeDeleted)

  const typeLowerCase = contractTypeString.toLowerCase()

  return cachedTypes.find(
    (currentType) => currentType.contractType.toLowerCase() === typeLowerCase
  )
}

export function getCachedContractTypeById(
  contractTypeId: number
): ContractType | undefined {
  const cachedTypes = getCachedContractTypes()

  return cachedTypes.find(
    (currentType) => currentType.contractTypeId === contractTypeId
  )
}

export function getCachedContractTypePrintsById(contractTypeId: number): string[] {
  const contractType = getCachedContractTypeById(contractTypeId)

  if (
    contractType?.contractTypePrints === undefined ||
    contractType.contractTypePrints.length === 0
  ) {
    return []
  }

  if (contractType.contractTypePrints.includes('*')) {
    return getConfigProperty('settings.contracts.prints')
  }

  return contractType.contractTypePrints ?? []
}

export function getCachedContractTypes(includeDeleted = false): ContractType[] {
  contractTypes ??= getContractTypesFromDatabase(includeDeleted)
  return contractTypes
}

export function clearContractTypesCache(): void {
  contractTypes = undefined
  allContractTypeFields = undefined
}