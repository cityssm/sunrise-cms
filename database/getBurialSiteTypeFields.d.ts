import type { PoolConnection } from 'better-sqlite-pool';
import type { BurialSiteTypeField } from '../types/recordTypes.js';
export default function getBurialSiteTypeFields(burialSiteTypeId: number, connectedDatabase?: PoolConnection): Promise<BurialSiteTypeField[]>;
