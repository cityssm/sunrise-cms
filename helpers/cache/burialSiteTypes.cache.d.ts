import type { BurialSiteType } from '../../types/record.types.js';
export declare function getCachedBurialSiteTypeById(burialSiteTypeId: number): BurialSiteType | undefined;
export declare function getCachedBurialSiteTypes(includeDeleted?: boolean): BurialSiteType[];
export declare function getCachedBurialSiteTypesByBurialSiteType(burialSiteType: string, includeDeleted?: boolean): BurialSiteType | undefined;
export declare function clearBurialSiteTypesCache(): void;
