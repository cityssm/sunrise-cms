type BurialSiteNameSearchType = 'startsWith' | 'endsWith' | '';
interface WhereClauseReturn {
    sqlWhereClause: string;
    sqlParameters: unknown[];
}
export declare function getBurialSiteNameWhereClause(burialSiteName?: string, burialSiteNameSearchType?: BurialSiteNameSearchType, burialSitesTableAlias?: string): WhereClauseReturn;
type OccupancyTime = '' | 'current' | 'past' | 'future';
export declare function getOccupancyTimeWhereClause(occupancyTime: OccupancyTime | undefined, lotOccupanciesTableAlias?: string): WhereClauseReturn;
export declare function getOccupantNameWhereClause(occupantName?: string, tableAlias?: string): WhereClauseReturn;
export {};
