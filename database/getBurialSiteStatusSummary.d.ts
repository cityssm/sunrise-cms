import type { BurialSiteStatus } from '../types/record.types.js';
interface GetFilters {
    cemeteryId?: number | string;
}
interface BurialSiteStatusSummary extends BurialSiteStatus {
    burialSiteCount: number;
}
export default function getBurialSiteStatusSummary(filters: GetFilters): Promise<BurialSiteStatusSummary[]>;
export {};
