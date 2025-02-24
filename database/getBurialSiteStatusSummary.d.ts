import type { BurialSiteStatus } from '../types/recordTypes.js';
interface GetFilters {
    cemeteryId?: number | string;
}
interface BurialSiteStatusSummary extends BurialSiteStatus {
    burialSiteCount: number;
}
export default function getBurialSiteStatusSummary(filters: GetFilters): Promise<BurialSiteStatusSummary[]>;
export {};
