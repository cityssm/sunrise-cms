import type { BurialSite } from '../types/record.types.js';
export default function getBurialSite(burialSiteId: number | string, includeDeleted?: boolean): Promise<BurialSite | undefined>;
export declare function getBurialSiteByBurialSiteName(burialSiteName: string, includeDeleted?: boolean): Promise<BurialSite | undefined>;
