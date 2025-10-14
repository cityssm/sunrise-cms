import sqlite from 'better-sqlite3';
export interface BurialSiteMapContract {
    contractId: number;
    contractType: string;
    isPreneed: number;
    contractStartDate: number;
    contractEndDate: number | null;
    deceasedNames: string[];
}
export interface BurialSiteForMap {
    burialSiteId: number;
    burialSiteName: string;
    burialSiteLatitude: number | null;
    burialSiteLongitude: number | null;
    cemeteryId: number | null;
    cemeteryName: string | null;
    contracts: BurialSiteMapContract[];
}
export interface BurialSiteMapResult {
    burialSites: BurialSiteForMap[];
    totalBurialSites: number;
    cemeteryLatitude: number | null;
    cemeteryLongitude: number | null;
}
export default function getBurialSitesForMap(cemeteryId: number | string, connectedDatabase?: sqlite.Database): BurialSiteMapResult;
