import type { Cemetery } from '../types/recordTypes.js';
export default function getCemeteries(filters?: {
    parentCemeteryId?: number | string;
}): Promise<Cemetery[]>;
