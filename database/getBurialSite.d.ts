import type { BurialSite } from '../types/recordTypes.js';
export declare function getBurialSiteByBurialSiteName(burialSiteName: string): Promise<BurialSite | undefined>;
export default function getBurialSite(burialSiteId: number | string): Promise<BurialSite | undefined>;
