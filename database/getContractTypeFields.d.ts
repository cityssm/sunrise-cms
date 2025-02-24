import type { PoolConnection } from 'better-sqlite-pool';
import type { ContractTypeField } from '../types/recordTypes.js';
export default function getContractTypeFields(contractTypeId?: number, connectedDatabase?: PoolConnection): Promise<ContractTypeField[]>;
