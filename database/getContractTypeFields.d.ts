import type { PoolConnection } from 'better-sqlite-pool';
import type { ContractTypeField } from '../types/record.types.js';
export default function getContractTypeFields(contractTypeId?: number, connectedDatabase?: PoolConnection): Promise<ContractTypeField[]>;
