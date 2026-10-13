import getContractTypeFieldsFromDatabase from '../../database/getContractTypeFields.js'
import getContractTypesFromDatabase from '../../database/getContractTypes.js'
import type {
  ContractType,
  ContractTypeField
} from '../../types/record.types.js'
import { getConfigProperty } from '../config.helpers.js'

const cache: {
  allContractTypeFields: ContractTypeField[] | undefined
  contractTypes: ContractType[] | undefined
} = {
  allContractTypeFields: undefined,
  contractTypes: undefined
}

export function getAllCachedContractTypeFields(): ContractTypeField[] {
  cache.allContractTypeFields ??= getContractTypeFieldsFromDatabase()
  return cache.allContractTypeFields
}

export function getCachedContractTypeByContractType(
  contractTypeString: string,
  shouldIncludeDeletedRecords = false
): ContractType | undefined {
  const cachedTypes = getCachedContractTypes(shouldIncludeDeletedRecords)

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

export function getCachedContractTypePrintsById(
  contractTypeId: number
): string[] {
  const contractType = getCachedContractTypeById(contractTypeId)

  if (
    contractType?.contractTypePrints === undefined ||
    contractType.contractTypePrints.length === 0
  ) {
    return []
  }

  return contractType.contractTypePrints.includes('*')
    ? getConfigProperty('settings.contracts.prints')
    : (contractType.contractTypePrints ?? [])
}

export function getCachedContractTypes(
  shouldIncludeDeletedRecords = false
): ContractType[] {
  if (shouldIncludeDeletedRecords) {
    return getContractTypesFromDatabase(shouldIncludeDeletedRecords)
  }

  cache.contractTypes ??= getContractTypesFromDatabase(shouldIncludeDeletedRecords)
  return cache.contractTypes
}

export function clearContractTypesCache(): void {
  cache.contractTypes = undefined
  cache.allContractTypeFields = undefined
}
