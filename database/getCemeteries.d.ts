import type { Cemetery } from '../types/record.types.js';
export default function getCemeteries(filters?: {
    parentCemeteryId?: number | string;
}): Promise<Cemetery[]>;
