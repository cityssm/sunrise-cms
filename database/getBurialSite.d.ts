import type { BurialSite } from '../types/record.types.js';
export default function getBurialSite(burialSiteId: number | string): Promise<BurialSite | undefined>;
export declare function getBurialSiteByBurialSiteName(burialSiteName: string): Promise<BurialSite | undefined>;
