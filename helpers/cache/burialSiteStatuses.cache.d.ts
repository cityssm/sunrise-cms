import type { BurialSiteStatus } from '../../types/record.types.js';
export declare function getCachedBurialSiteStatusByBurialSiteStatus(burialSiteStatus: string, includeDeleted?: boolean): BurialSiteStatus | undefined;
export declare function getCachedBurialSiteStatusById(burialSiteStatusId: number): BurialSiteStatus | undefined;
export declare function getCachedBurialSiteStatuses(includeDeleted?: boolean): BurialSiteStatus[];
export declare function clearBurialSiteStatusesCache(): void;
