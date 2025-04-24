import type { PoolConnection } from 'better-sqlite-pool';
import type { Fee } from '../types/record.types.js';
export default function getFee(feeId: number | string, connectedDatabase?: PoolConnection): Promise<Fee | undefined>;
