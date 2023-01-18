import type * as recordTypes from '../../types/recordTypes';
interface GetFilters {
    mapId?: number | string;
}
interface LotStatusSummary extends recordTypes.LotStatus {
    lotCount: number;
}
export declare function getLotStatusSummary(filters?: GetFilters): Promise<LotStatusSummary[]>;
export default getLotStatusSummary;
