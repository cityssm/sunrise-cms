import type { BurialSiteType } from '../types/recordTypes.js';
interface GetFilters {
    cemeteryId?: number | string;
}
interface BurialSiteTypeSummary extends BurialSiteType {
    lotCount: number;
}
export default function getBurialSiteTypeSummary(filters: GetFilters): Promise<BurialSiteTypeSummary[]>;
export {};
