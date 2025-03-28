import type { BurialSiteType } from '../types/recordTypes.js';
interface BurialSiteTypeSummary extends BurialSiteType {
    lotCount: number;
}
interface GetFilters {
    cemeteryId?: number | string;
}
export default function getBurialSiteTypeSummary(filters: GetFilters): Promise<BurialSiteTypeSummary[]>;
export {};
